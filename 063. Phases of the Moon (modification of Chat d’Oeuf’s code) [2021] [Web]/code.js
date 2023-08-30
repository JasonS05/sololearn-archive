// Created by Chat d'Oeuf (Baron) [12AM-10PM(CET)]

var normalize=a=>a.map(x=>x / Math.hypot(...a));
var fov=45;

var dot=(a,b)=>a.map((x,y)=>x * b[y]).reduce((x,y)=>x + y);

var c11width=256;
var c11height=256;

var newraysphereintersect=(center, radius, ro, rd)=>{
  var oc = [ro[0] - center[0], ro[1] - center[1], ro[2] - center[2]];
  var b = dot(oc, rd);
  var c = dot(oc, oc) - radius * radius;
  var discriminant = b * b - c;
  if (discriminant < 0) return false; // No hits
  var dist = -b - Math.sqrt(discriminant);
  var intersection = ro.map((a,b)=>a + rd[b] * dist);
  var normal = normalize(intersection.map((a,b)=>a - center[b]));
  return [dist,normal];
};

var lambertianshading=(pos, normal, light, color, intensity)=>{
  var lightdirection = normalize(pos.map((a,b)=>light[b] - a));
  var dotproduct = dot(lightdirection, normal);
  return color.map((a,b)=>dotproduct * a * intensity);
};

var mainpixelc11=(co, now)=>{
  var ro = [0, 0, -1e6]; //X, Y, Z
  var uv = [co[0] / c11width, co[1] / c11height]; //X / width, Y / height
  var rd = normalize([uv[0] * 2 - 1, uv[1] * 2 - 1, //UV * 2 - 1
  1 / Math.tan(fov / 180 * Math.PI / 2e5)]); //1 / tan(FoV), radians = degrees / 180 * Pi
  //Normalize our ray direction using the normalize function
  
  var sphereposition = [0, 0, 0];
  var sphereradius = 2;
  
  var intersection = newraysphereintersect(sphereposition, sphereradius, ro, rd);
  
  if (intersection) { // Test if hit
	var lightpos = [Math.sin(now / 2000) * 1e6, 0, Math.cos(now / 2000) * 1e6]; // Rotate the light around our sphere
	var color = [1, 1, 1]; // Red
	var lightintensity = 1;
	var normal = intersection[1];
	var newposition = ro.map((a,b)=>a + rd[b] * intersection[0]);
	
	var ambientlight = [0, 0, 0]; //Even if there isn't any light, this will give us some ambient lighting
	
	var shading = lambertianshading(newposition, normal, lightpos, color, lightintensity);
	
	var shadedcolor = shading.map((a,b)=>Math.max(a, 0) /*prevent it going into the negatives*/ + ambientlight[b] * color[b]);
	
	return shadedcolor; // Return shading
  }
  
  var t = (rd[1] + 1) / 2;
  var skycolor = [
	(1 - t) + t * .3,
	(1 - t) + t * .5,
	1
  ];
  return [0, 0, 0]; // Return sky background
};

// this function is mine. The rest of the code is Chat d'Oeuf's (except for some small modifications that I made).
var antialias=(col, x, y)=>{
  x -= c11width/2;
  y -= c11height/2;
  var dist = Math.hypot(x, y);
  var innerDist = (c11width - 4)/1.963/2;
  var outerDist = c11width/1.963/2;
  var multiplier = 1 - (Math.max(innerDist, Math.min(dist, outerDist)) - innerDist) / (outerDist - innerDist);
  return col.map(a=>a*multiplier*multiplier);
}

var canvas11frame=a=>{
  var now = Date.now();
  c = document.getElementsByClassName("canvas"+a)[0];
  [c.width, c.height, ctx] = [c11width, c11height, c.getContext("2d")];
  //-=-//
  var im = ctx.createImageData(c11width, c11height);
  for (var i = 0; i < im.data.length; i += 4) {
	var x = i / 4 % c11width;
	var y = ~~(i / 4 / c11width);
	var col = mainpixelc11([x, y], now);
	col = antialias(col, x, y);
	col.map((a,b)=>im.data[i + b] = ~~(Math.sqrt(a) * 255.99)); //Red, green, blue
	im.data[i + 3] = 255; //Alpha
  }
  ctx.putImageData(im, 0, 0); //Draw the image data
  window.requestAnimationFrame(()=>canvas11frame(999));
};

window.onload=()=>canvas11frame(999);
