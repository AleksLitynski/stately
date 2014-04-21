Stately
=========

Stately is my way of controling "state" when developing web apps. 

  1. All shared state resides in a single "json" object. (called the "state object")
  2. The structure of the state object is defined in one place. You can't tack new values onto it without officially noting it.
  3. You can register events against all mutations to the state object. 

Setup
-----

```js
require("./stately");
```
or
```html
<script type="text/javascript" src="stately.js"></script>
```

Make a state object (I *strongly* recomend only making one per page/project):

```javascript
    var state = stately({
        ready: "boolean",
    	kids: {
    		two: "string",
    		three: {
    			a: "number",
    			b: "string"
    		}
    	},
    	listy_loo: [
    		{a:"number", b:"string", c:["number"]}
    	]
    })
```


Object Types
------------

State objects are made up of 3 sub objects:
- Leafs: ```"boolean```, ```"string"```, or ```"number"```.
- Lists: ```[ "boolean" ]```. (Whatever state object is inside of the [ ] defines what each element in the list will look like.)
- Objects:```{ a: "boolean", b: "string" }```.


Working with objects/leaves
---------------------------

- Writing to a leaf:
    > ```state().ready(true) //-> 'ready' is now 'true'``` 

    > ```state().kids().three().a(5) //-> 'a' is now '5'```
- Reading from a leaf:
    > ```state().ready() //-> value of ready```
- Listening to a leaf:
    > ```
        state().ready(function(ready){
            console.log(ready); // -> the value of ready
            return true; // MUST RETURN TRUE TO RE-REGISTER THE EVENT. 
                         //Any other return (or no return) will un-register.
        })
    ```
    > *** Note that you cannot listen to "Objects", only "Leafs".

Working with Lists
------------------
- Grab a reference to a list:
    > ``` var a_list = state().listy_loo ```
- Lists present 4 functions:
    - length
        > ``` a_list().length() //-> length of the list ```
    - insert
        > ```a_list().insert(0)```
        
        > //-> creates a new, blank copy of the state object you specified when you called 'stately'. In tihs case, it will be a ```{a:"number", b:"string", c:["number"]}``` at index 0
    - remove
        > ```a_list().remove(0) //-> removes the element at index 0.```
    - get
        > ```a_list().get(0) //-> gets the element at index 0.```
- Lists support Events as well. (note that they do not alert you to changes to the lists element's values, only changes to the list itself):
        > ``` 
            a_list(function(type, index){
                //type will be:
                //      "general" -> triggered the first time an event is registered
                //      "remove"  -> triggered whenever an element is removed
                //      "insert"  -> triggered whenever an element is inserted. BEFORE THE CREATOR HAS A CHANGE TO UPDATE 
                //                   IT'S VALUES.
                //index           -> The index that was modifed. -1 for general.
                return true; //Must return true, or the event will become un-registered.
            }) 
        ```


Notes
-----

- I made this project to facilitate another project I'm working on. I'll link to it once I'm done so it can stand as a sample of how-to use Stately.
- I plan to add "history" logging soon. I debug from the console more than I use break-points. Because every access is a function, I can make my commens parameters and keep a history of when and how each value in the state-tree is changed. I think it'll help debugging. We'll see.


Other Fun Uses
-------------

- declare your own "micro states" and enforce type.
    - ```var guy = stately("string");```
    - ```guy("hello") //-> assignment OK!```
    - ```guy(false) //-> TypeError, false isn't a string!```
    - or, a list where each item has to be a certain object: ```var history = stately([{event:"string", year:"number"});```


