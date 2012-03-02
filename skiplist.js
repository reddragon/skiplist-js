util = require('util');

function sorted_list_finder_function(node, value) {
    if (node.v === value) {
        if (node.d === null) {
            return "Found";
        }
        return "Down";
    }

    if (node.v > value) {
       return "Down"; 
    }

    if (node.v < value) {
        if(node.r === null || node.r.rm === true || node.r.v > value) {
            return "Down";
        }
        return "Right";
    }
}

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
    
    // Setting the top-left pointer
    this.root = this.ls;

    // For those who are conscious about their PRNGs! :D
    this.coinflipper = coinflipper || function () { return Math.round(Math.random()); };

    // The max height we have TODO Check if this is needed
    this.h = 0;
}

SkipList.prototype =  {
    _promote_sentinels: function () {
        new_ls = new SkipListNode(null);
        new_rs = new SkipListNode(null);

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

        // Increase the total height
        this.h = this.h + 1;
    },

    insert_before: function (before, value) {
        // Are we messing with the left sentinel?
        if (before.lm) {
            return;
        }

        // Get the neighbors
        l = before.l;
        r = before;
        
        // Create a new node
        new_node = new SkipListNode(value);
        n = new_node;

        // Set the pointers of its left and right neighbors
        l.r = n;
        r.l = n;
        n.l = l;
        n.r = r;

        current_height = 0;
        old_node = n;
        
        while (this.coinflipper()) {
            //console.log("Heads");
                        
            current_height = current_height + 1;
            if (current_height > this.h) {
                //console.log("Height increased");
                this._promote_sentinels();
                //console.log(util.format('%d', this.h));
            }
            
            // Move left till you have an up pointer
            while (l.u === null) {
                l = l.l;
            }
            // Now actually move up
            l = l.u;
            
            // Move right till you have an up pointer
            while (r.u === null) {
                r = r.r;
            }
            // Now actually move up
            r = r.u;
            
            if (current_height > 0) {
                n = new SkipListNode(value);
            }
            
            // Setting up pointers with the neighbors
            l.r = n;
            r.l = n;
            n.l = l;
            n.r = r;

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
            return;
        }

        // Only nodes at the ground level can be deleted (for sanity sake)
        if (n.d !== null) {
            return;
        }

        while (1) {
            // Have we met Ted? :P
            n.l.r = n.r;
            n.r.l = n.l;
            if (n.u !== null) {
                upper_node = n.u;
                // TODO Verify if GC is needed.
                n = upper_node;
            }
            else {
                delete n;
                break;
            }
        }
    },

    find: function () {
    },

    _print_by_level: function () {
        level = this.root;
        while (level) {
            //console.log(util.format('%d', level.lm));
            level_node = level.r;
            //console.log(util.format('%d', level_node.rm));
            process.stdout.write('L ');
            while (level_node.rm !== true) {
                process.stdout.write(util.format('%d ', level_node.v));
                level_node = level_node.r;
            }
            process.stdout.write('R');
            process.stdout.write('\n');
            level = level.d;
        }
        process.stdout.write('\n');
    }
};

exports.SkipListNode = SkipListNode;
exports.SkipList = SkipList;

s = new SkipList();
a = s.insert_before(s.rs, 5);
b = s.insert_before(a, 3);
c = s.insert_before(a, 4);
s._print_by_level();
s.delete_node(b);
s._print_by_level();
