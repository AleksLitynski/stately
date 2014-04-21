(function(){

	//This function takes a json object and returns a state object.
	function obj_to_state(json_obj){
		type_error(json_obj.constructor != {}.constructor);

		var state_obj = {};

		//Take each object in the json, convert it to a state object, and attach it to the return.
		for (var key in json_obj) {
			if (json_obj.hasOwnProperty(key)) {
				state_val = "";
				json_val = json_obj[key];
				state_obj[key] = json_to_state(json_val);
			}
		}

		//We return a function so I can track accesses to the object for later event or stack-trace support
		return function(){
			return state_obj;
		}
	}

	//Takes a list object and converts it to a state object.
	//Element [0] of json_list is treated as a template for each item in the list, which are always created
	//as clones of [0]
	function list_to_state(json_list){
		type_error(json_list.constructor != [].constructor);
		type_error(json_list.length != 1);

		var element_pattern 	 = json_list[0];
		var element_pattern_type = pattern_type(element_pattern);
		var list_data	    = [];
		var listeners       = []; //function alterted of changes to the list itself (not changes to member elements).
		
		function call_all_listeners(reason, reason_index){
			for(var i = 0; i < listeners.length; i++){
				was_removed = call_listener(i, reason, reason_index);
				if(was_removed){
					i--;
				}
			}
		}

		function call_listener(index, reason, reason_index){
			persist = listeners[index](reason, reason_index);
			if(persist !== true){
				listeners.splice(index, 1)
				return true;
			}
			return false;
		}


		return function(listener){

			if(typeof listener != "undefined"){ //If we give a function, it is attached as a listener.
				listener_index = listeners.push(listener)-1;
				call_listener(listener_index, "general", -1);
			}

			return {

				get: function(index){ //returns the element at a given index.
					if(element_pattern_type == "leaf"){
						//if it is a leaf, leave it boxed. 
						//All functions are on the leaf itself, 
						//which is tidy usually, but is clearly 
						//messy in this case. 
						//Not sure if I'll change that or not.
						//ie: leaf() -> "a" + list(0)() -> a 
						//vs: leaf.get_val() -> a. + list(0).get_val(a)
						return list_data[index];
					} else {
						//if it is an obj/list, auto-unbox it. 
						return list_data[index]();
					}
					
				},
				remove: function(index){ //removes item at index than calls callbacks
					list_data.splice(index, 1);
					call_all_listeners("remove", index);
				},
				insert: function(index){ //adds a blank copy of the template, then calls callbacks.
										 //note, callbacks are called before you have a change to 
										 //update values of the object added.
					list_data.splice(index, 0, json_to_state(element_pattern));
					call_all_listeners("insert", index);
				},
				length: function(){
					return list_data.length;
				}
			}
		}
	}

	//converts numbers, strings, and booleans to leafs
	function leaf_to_state(json_leaf){
		type_error(typeof json_leaf != "string");
		//prevent arrays and lists from becoming leafs.
		type_error(json_leaf != "boolean" && json_leaf != "string" && json_leaf != "number");

		var type = json_leaf;
		var value;
		var listeners = [];

		function call_all_listeners(){
			for(var i = 0; i < listeners.length; i++){
				was_removed = call_listener(i);
				if(was_removed){
					i--;
				}
			}
		}

		//Calls the listener function at index.
		//Will remove listener function, unless true was returned.
		//This allows function to remove their own listener based on
		//internal logic.
		function call_listener(index){
			persist = listeners[index](value);
			if(persist !== true){
				listeners.splice(index, 1)
				return true;
			}
			return false;
		}

		return function(input){

			//There is no value given. We return the stored value
			if(typeof input == 'undefined'){
				return value;
			}

			//A function is given. Register the listener and call it once.
			if(typeof input == "function"){
				index = listeners.push(input)-1;
				if(typeof value != 'undefined'){
					call_listener(index);
				}
			}

			//A new value is given. If it's type matches the proper type, 
			if(typeof input == type){
				value = input;
				call_all_listeners();
			}
		}
	}

	//Used to trigger an error if we're given wrong data.
	//Not sure what error to throw, exactly. For now, "TypeError"
	//will suffice.
	function type_error(test){
		if(test){
			throw new Error("TypeError");
		}
	}

	//Checks the type of each object added to state.
	//"boolean" || "string" || "number" -> "leaf"
	//{} -> object
	//[] -> list
	function pattern_type(pattern){
		if(typeof pattern == "string"){
			return "leaf";
		}
		if(pattern.constructor == {}.constructor){
			return "object";
		}
		if(pattern.constructor == [].constructor){
			return "list";
		}
	}

	//converts arbitrary objects to state.
	//Can take {}, [], "boolean" || "string" || "number", and
	//return a state.
	function json_to_state(json_state){

		var state_val;
		var json_pattern_type = pattern_type(json_state);
		if(json_pattern_type == "leaf"){
			state_val = leaf_to_state(json_state);
		}
		if(json_pattern_type == "object"){
			state_val = obj_to_state(json_state);
		}
		if(json_pattern_type == "list"){
			state_val = list_to_state(json_state);
		}

		return state_val;
	};

	//attach to nodejs or browser global object
    try { window.stately = json_to_state; } catch(e) {}
    try { global.stately = json_to_state; } catch(e) {}
    
    //also return the object. Just for shits, I guess?
    return json_to_state;
	
})()

