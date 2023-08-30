/*
Normally Java only supports single dispatch. This means
that the actual method called can only be affected by
the runtime type of the first argument (receiver object)
which in java is passed implicitly and is found to the
left of the decimal point used when invoking a method.

For example, in "a.someMethod(b, c)" the method that is
called can only be affected by the runtime type of "a".
The runtime types of "b" and "c" are irrelevant. The
static compile-time types are used. This is called single
dispatch because the method called is defined by a single
parameter.

In double dispatch, the runtime types of two parameters
are used. By using Java's single dispatch twice I can
implement double dispatch. With this, I determine which
of four possible strings to return without involving any
if statements.
*/

public class Program {
	public static void main(String[] args) {
		Bool tru = new True();
		Bool fal = new False();
		
		System.out.println(Bool.stringify(fal, fal));
		System.out.println(Bool.stringify(tru, fal));
		System.out.println(Bool.stringify(fal, tru));
		System.out.println(Bool.stringify(tru, tru));
	}
}

abstract class Bool {
	public static String stringify(Bool b1, Bool b2) {
		return b2._stringify(b1);
	}
	
	abstract public String _stringify(Bool b);
	abstract public String _stringify(True t);
	abstract public String _stringify(False t);
}

class True extends Bool {
	public String _stringify(Bool b) {
		return b._stringify(this);
	}
	
	public String _stringify(True t) {
		return "true, true";
	}
	
	public String _stringify(False t) {
		return "true, false";
	}
}

class False extends Bool {
	public String _stringify(Bool b) {
		return b._stringify(this);
	}
	
	public String _stringify(True t) {
		return "false, true";
	}
	
	public String _stringify(False t) {
		return "false, false";
	}
}

