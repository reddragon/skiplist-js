# A Generic Skiplist in JavaScript 

Operations:
  
  * insert_before(node, value): 
    Inserts a new node before the node 'node', with value 'value'.
    Returns the inserted node.
    O(log n) whp
  
  * insert_after(node, value):
    Similar to insert_before, but after the node 'node'.
    O(log n) whp

  * lower_bound(node):
    Find the greatest node, which is less than or equal to the value of 'node'.
    O(log n) whp

  * delete(node):
    Deletes the node 'node'
    O(log n) whp

Credits:
  * [Dhruv Matani](http://github.com/dhruvbird) for the inspiration and help with
    the project.
