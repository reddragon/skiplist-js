util = require('util');

function SkipListNode(value) {
    // Setting the value and initializing the direction pointers
    this.v = value;
    this.l = null;
    this.r = null;
    this.u = null;
    this.d = null;
}

function SkipList(coinflipper) {
    // Left Sentinel & Right Sentinels
    this.ls = new SkipListNode(null);
    this.rs = new SkipListNode(null);
 
    // Setting up their pointers
    this.ls.r = this.rs;
    this.rs.l = this.ls;

    // Is this the left sentinel?
    this.ls.lm = true;

    // Is this the right sentinel?
    this.rs.rm = true;

    // Create the first and last pointers
    this.first = this.ls;
    this.last = this.rs;
    
    // Setting the top-left pointer
    this.root = this.ls;

    // For those who are conscious about their PRNGs! :D
    this.coinflipper = coinflipper || function () { return Math.round(Math.random()); };
}

SkipList.prototype =  {
    _promote_sentinels: function () {
        var new_ls = new SkipListNode(null);
        var new_rs = new SkipListNode(null);

        // They are sentinels
        new_ls.lm = true;
        new_rs.rm = true;

        // Set the pointers
        new_ls.d = this.ls;
        new_rs.d = this.rs;
        this.ls.u = new_ls;
        this.rs.u = new_rs;
        new_ls.r = new_rs;
        new_rs.l = new_ls;
        
        // Update the sentinels
        this.ls = new_ls;
        this.rs = new_rs;
        
        // Set the new root
        this.root = this.ls;
    },
    
    _demote_sentinels: function () {
        if (this.ls.r !== this.rs || this.ls.d === null) {
            throw new Error('Sentinels can\'t be demoted any further');
        }

        var new_ls = this.ls.d;
        var new_rs = this.rs.d;
        new_ls.u = null;
        new_rs.u = null;
        
        // Update the sentinels
        this.ls = new_ls;
        this.rs = new_rs;
        
        // Set the new root
        this.root = this.ls;
    },

    insert_before: function (before, value) {
        // Are we messing with the left sentinel?
        if (before.lm) {
            throw new Error('Cannot insert before the left sentinel.'); 
        }
        
        if (value.value_str) {
            process.stdout.write(util.format('Inserting value: %s\n', value.value_str()));
        }
        //console.log(util.format('Inserting value %d', value));

        // Get the neighbors
        var l = before.l;
        var r = before;
        
        // Create a new node
        var new_node = new SkipListNode(value);
        var n = new_node;

        // Set the pointers of its left and right neighbors
        l.r = n;
        r.l = n;
        n.l = l;
        n.r = r;
        var old_node = n;
        
        while (this.coinflipper()) {
             console.log('Heads');
                        
            // Move left till you have an up pointer
            while (l.u === null && !l.lm) {
                if (l.lm) 
                    console.log('Dangerous things gonna happen');
                l = l.l;
                // TODO Call left traversal hook function
            }

            // Our left is a sentinel, and no one lives upstairs.
            if (l.lm === true && l == this.root) {
                // console.log('Height increased');
                this._promote_sentinels();
                //console.log(util.format('%d', this.h));
            }

            // Now actually move up
            l = l.u;
            // TODO Call left-move up hook function
            
            // Move right till you have an up pointer
            while (r.u === null) {
                r = r.r;
                // TODO Call right traversal hook function
            }
            // Now actually move up
            r = r.u;
            // TODO Call right-move up hook function
            
            n = new SkipListNode(value);
            
            // Setting up pointers with the neighbors
            l.r = n;
            r.l = n;
            n.l = l;
            n.r = r;
            // TODO Call update hook function

            // Chaining up with the old node
            old_node.u = n;
            n.d = old_node;

            // For chaining up with the node at the next level
            old_node = n;
        } 

        return new_node;
    },

    delete_node: function(n) {
        // We love our sentinels!
        if (n.lm === true || n.rm === true) {
            throw new Error('Cannot delete sentinels');
        }
        
        // console.log(util.format('Deleting node %d', n.v));

        // Only nodes at the ground level can be deleted (for sanity sake)
        if (n.d !== null) {
            throw new Error('Can only delete nodes at the ground level.');
        }

        while (1) {
            // Have we met Ted? :P
            n.l.r = n.r;
            n.r.l = n.l;
            if (n.u !== null) {
                var upper_node = n.u;
                n = upper_node;
            }
            else {
                break;
            }
        }
    },

    lower_bound: function (t) {
        // TODO Finish this
        
        // We need to demote the sentinels, they are just linking to each other
        while (this.ls.r == this.rs && this.ls.d) {
            // console.log('_demote_sentinels() called');
            this._demote_sentinels();
        }
        
        // If we have an empty list
        if (this.ls.r === this.rs) {
            return null;
        }
        
        var n = this.root;
        //console.log(util.format('Right is null?: %d', n.r === null));  
        var prev_test_node = n;
        while (1) {
            prev_test_node = n;
            var test_node = n.r;

            // If we haven't defined the less_than function for the test_node, we can't move ahead.
            if (!test_node.v.leq)
                return null;
            
            if (test_node.v.value_str)
                console.log(util.format('Test Node: %s, value: %d, leq: %d', test_node.v.value_str(), t.value, test_node.v.leq(t)));

            if (test_node.v.leq(t)) {
                //console.log('Yes\n');
                // Sentinel ahead
                if  (test_node.r.rm) {
                    // We cannot go down
                    //console.log(util.format('Found a sentinel here, down: %d %d', test_node.d === null, test_node.d.v));
                    if (test_node.d === null) {
                        console.log('Returning right sentinel');
                        return test_node;
                    }
                    // Because we move to the right, when we begin this loop, 
                    // and we want to be at exactly below our current position when we resume
                    n = test_node.d.l;
                }
                else {
                    n = test_node;
                }
            }
            else {
                //console.log('No\n');
                // At the ground level
                if (n.d == null) {
                    // We cannot go down, test_node is either the desired node, 
                    // or its successor, or if the value is greater than the 
                    // value of the last node, then we return the last element
                    return prev_test_node;
                }
                else { 
                    n = n.d;
                }
            }

        }
    },

    _print_by_level: function () {
        var level = this.root;
        // If you haven't defined the value_str() function, we can't help
        //if (!level.r.v.value_str)
        //    return;

        while (level) {
            //console.log(util.format('%d', level.lm));
            var level_node = level.r;
            //console.log(util.format('%d', level_node.rm));
            process.stdout.write('L');
            while (level_node.rm !== true) {
                // process.stdout.write(util.format('%d ', level_node.v));
                process.stdout.write(util.format(' %s', level_node.v.value_str()));
                level_node = level_node.r;
            }
            process.stdout.write(' R');
            process.stdout.write('\n');
            level = level.d;
        }
        process.stdout.write('\n');
    }
};


// Some basic test code. TODO Create tests.js

function less_than (s, t) {
    // console.log(util.format('%d %d %d\n', n.v.value, value.value, ( (n.v.value < value.value) ? true : false )));
}


function IntegerNode (v) {
    this.value = v;
}

IntegerNode.prototype = {
    value_str: function () {
        // Returns a formatting string containing the value
        return util.format('%d', this.value);
    },
    print: function() {
        process.stdout.write(util.format('%d\n', this.value));
    },
    // Less than or equal to
    leq: function(t) {
        return ((this.value <= t.value) ? true : false );
    }
}



exports.SkipListNode = SkipListNode;
exports.SkipList = SkipList;

var five = new IntegerNode(5);
var three = new IntegerNode(3);
var four = new IntegerNode(4);
var nine = new IntegerNode(9);
var eleven = new IntegerNode(11);
var twelve = new IntegerNode(12);
s = new SkipList()
a = s.insert_before(s.last, five);
b = s.insert_before(a, three);
c = s.insert_before(a, four);
d = s.insert_before(s.last, nine);
e = s.insert_before(s.last, eleven);
f = s.insert_before(s.last, twelve);
s._print_by_level();
s.delete_node(b);
s._print_by_level();
n = s.lower_bound(eleven);
n.v.print();
n = s.lower_bound(new IntegerNode(10));
n.v.print();
n = s.lower_bound(new IntegerNode(12));
n.v.print();
n = s.lower_bound(new IntegerNode(13));
n.v.print();
/*
// TODO Gracefully handle this case, when the number
// searched for, is smaller than the smallest number
// in the list
n = s.lower_bound(new IntegerNode(1));
n.v.print();
*/
/*
s = new SkipList();
a = s.insert_before(s.last, 5);
b = s.insert_before(a, 3);
c = s.insert_before(a, 4);
d = s.insert_before(s.last, 9);
e = s.insert_before(s.last, 11);
f = s.insert_before(s.last, 12);
s._print_by_level();
s.delete_node(b);
s._print_by_level();
n = s.find(less_than, 4);
console.log('\n');
o = s.find(less_than, 7);
console.log('\n');
p = s.find(less_than, 13);
console.log('\n');
q = s.find(less_than, 10);
console.log('\n');
//m = s.find(less_than, 11);
//console.log(util.format('%d', n.v));
s._print_by_level(); 
*/
