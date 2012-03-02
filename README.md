# A Generic Skiplist in JavaScript 

Operations:
  
  * insert_before(node, value): 
    Inserts a new node before the node 'node', with value 'value'.
    Returns the inserted node.
    O(log n)
  
  * insert_after(node, value):
    Similar to insert_before, but after the node 'node'.
    O(log n)

  * find(finder_function):
    Returns the node to be found, using the supplied finder_function.
    The finder_function, should, when passed a node, return 'R', 'D', 
    or 'F', if it needs to move right, down, or the node was found
    respectively.
    O(log n)

  * delete(node):
    Deletes the node 'node'
    O(log n)


