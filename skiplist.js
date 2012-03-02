function SkipListNode(value) {
    // Setting the value and initializing the direction pointers
    this.v = value;
    this.l = null;
    this.r = null;
    this.u = null;
    this.d = null;
}

function SkipList() {
    // Left Sentinel & Right Sentinels
    this.ls = new SkipListNode(null);
    this.rs = new SkipListNode(null);
    
    // Setting up their pointers
    this.ls.r = this.rs
    this.rs.l = this.ls

    // Is this the left sentinel?
    this.ls.lm = true;

    // Is this the right sentinel?
    this.rs.rm = true;
    
    // Setting the top-left pointer
    this.root = this.lm;
}

SkipList.prototype =  {
    
};

exports.SkipListNode = SkipListNode;
exports.SkipList = SkipList;
