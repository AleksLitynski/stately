//Test may be a strong word for this file. It's more like a... testbed. 

require("../stately");

//Create a new state object
state = stately(
{
	val: "number", // Leafs are always "number" or "string"
	kids: {
		two: "string", //objects can have lists + numbers + strings
		three: {
			a: "number",
			b: "string"
		}
	},
	listy_loo: [ //each list item must match the sample list item's format.
		{a:"number", b:"string", c:["number"]}
	]
}
)


//left and node tests
//Leafs work as expected.
//Listeners: Good
//Remove Listener: Good
//Get value without listener: Good
state().val(function(v){
	console.log(v);
	if(v != 99){
		return true;
	}
});
state().val(function(v){
	console.log("nfg: " + v);
	return true;
});
state().val(10);
state().val(20);
state().val(99);
state().val(10);
//Get nested value: Good
state().kids().two("hexproof");
console.log(state().kids().two());
//Attempt to assign value of wrong type: Fails!: Good
state().kids().two(5);
console.log(state().kids().two());
//3x nsed objects!
state().kids().three().a(function(a){
	console.log(a);
	return true;
});
state().kids().three().a(10);
//list insert/remove/access tests
state().listy_loo().insert(0);
state().listy_loo().insert(0);
state().listy_loo().insert(0);
state().listy_loo().insert(0);
console.log(state().listy_loo().get(2));
console.log(state().listy_loo().get(3));
state().listy_loo().remove(0);
state().listy_loo().get(2).a(function(a){
	console.log(a*3);
	return true;
});
state().listy_loo().get(2).a(5);
console.log(state().listy_loo().get(2).a());
state().listy_loo().get(2).a(5);
state().listy_loo().get(2).a(6);
state().listy_loo().get(2).a(7);
state().listy_loo().get(2).a(8);
state().listy_loo().get(2).b("guy");
console.log(state().listy_loo().get(2).b());

//list modification event tests
//discovered making [lists of leaves] results in UGLY code.
//had to support a special case wherein I don't unbox the values.
//It's a trade off between saying: a() and a.get_value().
//downside is: list.get(0)() vs list.get(0).get_value().
state().listy_loo().insert(0)
var num_list = state().listy_loo().get(0).c;
num_list(function(type,index){
	var out = type + ": ";
	for(var i = 0; i < num_list().length(); i++){
		out += ", " + num_list().get(i)();
	}
	console.log(out);
	return true;
})
num_list().insert(0);
num_list().get(0)(5);
num_list().insert(1);
num_list().get(1)(5);
num_list().remove(1);
console.log( num_list().get(0)() );
