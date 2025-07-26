export const getObjectsByGroup = (groupNumber, arrayOfObjects) => {
  return arrayOfObjects.filter((obj) => obj.group === groupNumber);
};

export const steps = {
  "compsci-en": [
    {
      group: "introduction",
      title: "Introduction To Computer Science",
      isStudyGuide: true,
      description:
        "Expose yourself to fundamentals to improve the quality of your learning before making progress.",
      question: {
        questionText: (
          <div>
            <p style={{ marginBottom: 12 }}>
              {" "}
              One of the best predictors for student success is exposure to
              course material before studying it. You're encouraged to read
              about the fundamentals of software in the study guide before
              starting. You can reference this study guide in the menu
              throughout your progress too.
            </p>

            <p style={{ marginBottom: 12 }}>
              Remember to fail faster and fail forward! The real education
              happens when you push through a challenge. We'll start off nice
              and easy at first, but then we'll start to level up the difficulty
              as you collect more progress. Make sure to use the tools at your
              disposal! You're going to need it.
            </p>
          </div>
        ),
        metaData: `
We’ll evolve a single dataset through each core chapter to illustrate connections:

1. Data Structures I — Arrays & Strings
\`\`\`python
# Step 1: Start with a list of numbers
data = [3, 1, 4, 1, 5]
print(data[2])           # O(1) access → 4
\`\`\`
Lists store items contiguously, allowing constant-time reads but dynamic sizing.

2. Data Structures II — Linked Lists
\`\`\`python
# Step 2: Convert list into a singly linked list
class Node:
    def __init__(self, value):
        self.value = value
        self.next = None

def to_linked_list(arr):
    head = None
    for item in reversed(arr):
        node = Node(item)
        node.next = head
        head = node
    return head

list_head = to_linked_list(data)
print(list_head.value)   # 3 at head, traversal is O(n)
\`\`\`
Linked lists allow dynamic insertion but require linear traversal for access.

3. Data Structures III — Trees (Array & Hash Map)
\`\`\`python
# 3a. Binary heap stored in an array (complete binary tree)
heap = [None, 3, 1, 4, 1, 5]  # 1-based index: parent i, children 2i & 2i+1
root, left, right = heap[1], heap[2], heap[3]
print(root, left, right)      # 3 1 4

# 3b. General tree with an adjacency hash map
tree = {
    "A": ["B", "C"],
    "B": ["D", "E"],
    "C": ["F"],
    "D": [], "E": [], "F": []
}

# 3c. Depth-First Search (DFS) — preorder
def dfs(node):
    stack = [node]
    while stack:
        cur = stack.pop()
        print(cur, end=" ")
        # push children in reverse to visit left-to-right
        for child in reversed(tree[cur]):
            stack.append(child)

dfs("A")   # A B D E C F  — O(n)

# 3d. Breadth-First Search (BFS)
from collections import deque
def bfs(node):
    q = deque([node])
    while q:
        cur = q.popleft()
        print(cur, end=" ")
        q.extend(tree[cur])

bfs("A")   # A B C D E F  — O(n)
\`\`\`
*Array* representation offers O(1) parent/child math for complete trees (heaps);  
a *hash-map* adjacency list provides flexible, sparse storage with O(1) add-child.  
DFS explores depth before breadth using a stack; BFS explores level by level using a queue.

4. Algorithms I — Sorting
\`\`\`python
# Step 4: Sort the list in-place via bubble sort
def bubble_sort(a):
    n = len(a)
    for i in range(n):
        for j in range(0, n - i - 1):
            if a[j] > a[j + 1]:
                a[j], a[j + 1] = a[j + 1], a[j]

bubble_sort(data)
print(data)  # [1, 1, 3, 4, 5] • O(n²)
\`\`\`
Elementary sorts teach algorithmic structure; bubble sort is O(n²).

5. Algorithms II — Search
\`\`\`python
# Step 5: Perform binary search on sorted list
def binary_search(a, target):
    low, high = 0, len(a) - 1
    while low <= high:
        mid = (low + high) // 2
        if a[mid] == target:
            return mid
        elif a[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1

pos = binary_search(data, 4)
print(pos)  # index of value 4, O(log n)
\`\`\`
Divide-and-conquer search runs in logarithmic time.

6. Operating Systems — File I/O
\`\`\`python
# Step 6: Read a file with OS support
with open('data.txt', 'r', encoding='utf-8') as f:
    contents = f.read()
print(contents)
\`\`\`
Behind the scenes: the OS schedules I/O, buffers data, and performs context switches.

***Advice***

***Trace manually:*** Walk through indices, pointers **and DFS/BFS orderings** on paper.  
***Annotate:*** Mark time complexities alongside loops (# O(n²), # O(log n)).  
***Experiment:*** Tweak each example in your REPL or editor to see real outputs.

This single evolving example now links arrays, linked lists, **tree representations with DFS & BFS**, algorithms, and OS interactions—showing how each layer builds on the last.
`,
      },
    },

    {
      group: "tutorial",
      title: "OOP Basics: Class and Instance",
      description: "Identify classes vs. instances in Python.",
      isMultipleChoice: true,
      question: {
        questionText:
          "In Python OOP, which of the following best describes a class?",
        options: [
          "A blueprint that defines attributes and behaviors",
          "A specific object created during execution",
          "A standalone function outside of any object",
          "A module imported into a script",
        ],
        answer: "A blueprint that defines attributes and behaviors",
      },
    },
    {
      group: "tutorial",
      title: "Defining __init__ and Methods",
      description: "Order Python class definition steps.",
      isSelectOrder: true,
      question: {
        questionText:
          "Arrange the steps to define a Python class with an __init__ and a method:",
        options: [
          "Use class keyword with class name",
          "Define __init__ method with parameters (self, ...)",
          "Define additional methods indented at class level",
          "Instantiate the class by calling ClassName()",
        ],
        answer: [
          "Use class keyword with class name",
          "Define __init__ method with parameters (self, ...)",
          "Define additional methods indented at class level",
          "Instantiate the class by calling ClassName()",
        ],
      },
    },
    {
      group: "tutorial",
      title: "Creating an Instance",
      description: "Select correct steps to instantiate a Python object.",
      isMultipleAnswerChoice: true,
      question: {
        questionText:
          "Select all the correct steps to create an object from a Python class:",
        options: [
          "Call the class with parentheses and required arguments",
          "Assign the result to a variable",
          "Import the class from its module",
          "Pass arguments to __init__",
        ],
        answer: [
          "Call the class with parentheses and required arguments",
          "Assign the result to a variable",
          "Pass arguments to __init__",
        ],
      },
    },
    {
      group: "tutorial",
      title: "Code Completion: Define a Python Class",
      description: "Choose the correct class definition snippet.",
      isCodeCompletion: true,
      question: {
        questionText:
          "Which snippet correctly defines a Python class Person with name and age?",
        options: [
          "class Person:\n    def __init__(self, name, age):\n        self.name = name\n        self.age = age",
          "def Person(name, age):\n    return { 'name': name, 'age': age }",
          "class Person(name, age):\n    self.name = name\n    self.age = age",
          "class Person:\n    name = None\n    age = None",
        ],
        answer:
          "class Person:\n    def __init__(self, name, age):\n        self.name = name\n        self.age = age",
      },
    },
    {
      group: "tutorial",
      title: "Implement a Method",
      description: "Add a method to your Python class.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Extend the Person class by adding a greet(self) method that returns 'Hello, my name is ' + self.name.",
        answer: null,
      },
    },
    {
      group: "tutorial",
      title: "Accessing Attributes",
      description: "Recall Python attribute access syntax.",
      isSingleLineText: true,
      question: {
        questionText:
          "What syntax retrieves the age attribute from a person instance?",
        placeholder: "Type your answer here...",
        answer: "person.age",
      },
    },
    {
      group: "tutorial",
      title: "Shell Practice: Initialize Python Project",
      description:
        "Use Bash to set up a new project directory and Python file.",
      isCode: true,
      isTerminal: true,
      question: {
        questionText:
          "In Bash, create a directory named `project`, change into it, and then create an empty Python file called `app.py`.",
        answer: "mkdir project && cd project && touch app.py",
      },
    },

    {
      group: "tutorial",
      title: "OOP Benefit",
      description: "Explain an advantage of Python OOP.",
      isText: true,
      question: {
        questionText:
          "In your own words, explain one advantage of using classes and objects in Python.",
        answer: null,
      },
    },
    {
      group: "tutorial",
      title: "Review With AI Conversation (optional)",
      isConversationReview: true,
      description: "Review the subjects you've answered",
      question: {
        questionText: "Let's chat about the questions we've worked on so far.",
        range: [1, 8],
      },
    },

    // 1
    {
      group: "1",
      title: "Abstract Data Types vs. Concrete Implementations",
      description:
        "Distinguish abstract data types (ADTs) from their concrete implementations.",
      isMultipleChoice: true,
      question: {
        questionText: "Which of the following are abstract data types?",
        options: ["List", "Stack", "Queue", "Array", "Binary Tree"],
        answer: ["Stack", "Queue", "Binary Tree"],
      },
    },
    // 2
    {
      group: "1",
      title: "Complexity Classes Ordering",
      description:
        "Order common complexity classes from fastest to slowest growth.",
      isSelectOrder: true,
      question: {
        questionText:
          "Arrange these complexity classes from fastest (lowest growth) to slowest (highest growth):",
        options: ["O(1)", "O(log n)", "O(n)", "O(n log n)", "O(n²)"],
        answer: ["O(1)", "O(log n)", "O(n)", "O(n log n)", "O(n²)"],
      },
    },
    // 3
    {
      group: "1",
      title: "Array Access Complexity",
      description: "Identify the time complexity of array indexing.",
      isMultipleChoice: true,
      question: {
        questionText:
          "What is the Big-O time complexity to access an element by index in a contiguous array?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
        answer: "O(1)",
      },
    },
    // 4
    {
      group: "1",
      title: "Contiguous vs. Non-contiguous Storage",
      description: "Distinguish data structures by their memory layout.",
      isMultipleChoice: true,
      question: {
        questionText:
          "Which data structure stores its elements contiguously in memory?",
        options: ["Array", "Linked List", "Binary Tree", "Hash Table"],
        answer: "Array",
      },
    },
    // 5
    {
      group: "1",
      title: "Python List Indexing",
      description: "Practice simple list indexing in Python.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Create a Python list called `nums` with values `[3, 1, 4, 1, 5]` and print the third element (index 2).",
      },
    },
    // 6
    {
      group: "1",
      title: "List Indexing Code Completion",
      description: "Fill in the missing code to index a Python list.",
      isCodeCompletion: true,
      question: {
        questionText: "Complete the following code:",
        options: [
          "nums = [3, 1, 4, 1, 5]\nprint(nums[2])",
          "nums = [3, 1, 4, 1, 5]\nprint(nums[3])",
          "nums = [3, 1, 4, 1, 5]\nprint(nums[len(nums)])",
        ],
        answer: "nums = [3, 1, 4, 1, 5]\nprint(nums[2])",
      },
    },
    // 7
    {
      group: "1",
      title: "Why Complexity Matters",
      description: "Reflect on the importance of algorithmic complexity.",
      isText: true,
      question: {
        questionText:
          "In your own words, explain why understanding time complexity (Big-O) is important when choosing a data structure.",
      },
    },
    // 8
    {
      group: "1",
      title: "Amortized Analysis of append()",
      description: "Identify amortized time complexity of Python list append.",
      isMultipleChoice: true,
      question: {
        questionText:
          "What is the amortized time complexity of `list.append()` in Python?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
        answer: "O(1)",
      },
    },
    // 9
    {
      group: "1",
      title: "Dynamic Array Resizing Steps",
      description:
        "Order the internal steps that a dynamic array takes when it grows.",
      isSelectOrder: true,
      question: {
        questionText:
          "Arrange the steps Python’s list takes when it needs more capacity:",
        options: [
          "Allocate new larger block",
          "Copy old elements to new block",
          "Free the old block",
          "Update internal pointer",
        ],
        answer: [
          "Allocate new larger block",
          "Copy old elements to new block",
          "Free the old block",
          "Update internal pointer",
        ],
      },
    },
    // 10
    {
      group: "1",
      title: "Traversing a List",
      description: "Write code to traverse and print each element of a list.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Given `items = [10, 20, 30, 40]`, write a Python for-loop that prints each item.",
      },
    },
    // 11
    {
      group: "1",
      title: "List Length Operator",
      description: "Identify the operator that returns the length of a list.",
      isSingleLineText: true,
      question: {
        questionText:
          "Which Python built-in function returns the number of elements in a list?",
        placeholder: "Type your answer here...",
        answer: "len",
      },
    },
    // 12
    {
      group: "1",
      title: "Immutable vs. Mutable Sequences",
      description: "Distinguish lists from tuples in Python.",
      isMultipleChoice: true,
      question: {
        questionText: "Which of the following statements is true?",
        options: [
          "Lists are immutable, tuples are mutable",
          "Lists are mutable, tuples are immutable",
          "Both are immutable",
          "Both are mutable",
        ],
        answer: "Lists are mutable, tuples are immutable",
      },
    },
    // 13
    {
      group: "1",
      title: "String as Character Array",
      description: "Convert a string into a list of its characters.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Write Python code to turn the string `\"hello\"` into `['h','e','l','l','o']`.",
      },
    },
    // 14
    {
      group: "1",
      title: "Implementing a Simple Stack",
      description: "Use a Python list to model a stack (LIFO).",
      isCodeCompletion: true,
      question: {
        questionText: "Complete the methods to push and pop from a stack:",
        options: [
          // Correct: uses append and pop(), returns the popped value
          `class Stack:
    def __init__(self):
        self.data = []

    def push(self, x):
        self.data.append(x)

    def pop(self):
        return self.data.pop()`,

          // Wrong: forgets to return the popped value
          `class Stack:
    def __init__(self):
        self.data = []

    def push(self, x):
        self.data.append(x)

    def pop(self):
        self.data.pop()`,

          // Wrong: uses FIFO pop(0) instead of LIFO
          `class Stack:
    def __init__(self):
        self.data = []

    def push(self, x):
        self.data.append(x)

    def pop(self):
        return self.data.pop(0)`,

          // Wrong: inserts at the front, reversing the order
          `class Stack:
    def __init__(self):
        self.data = []

    def push(self, x):
        self.data.insert(0, x)

    def pop(self):
        return self.data.pop()`,
        ],
        answer: `class Stack:
    def __init__(self):
        self.data = []

    def push(self, x):
        self.data.append(x)

    def pop(self):
        return self.data.pop()`,
      },
    },
    // 15
    {
      group: "1",
      title: "Use Cases for Different Structures",
      description: "Reflect on where you’d use arrays vs. stacks.",
      isText: true,
      question: {
        questionText:
          "Give one real-world scenario where a stack (LIFO) is preferred over a plain list.",
      },
    },
    // 16
    {
      group: "1",
      title: "Pointer-Style Traversal (Conceptual)",
      description: "Understand how a linked list differs in traversal.",
      isText: true,
      question: {
        questionText:
          "In contrast to arrays, how does a linked list traverse from one element to the next?",
      },
    },
    // 17
    {
      group: "1",
      title: "Implementing a Queue with deque",
      description: "Use `collections.deque` to model a queue (FIFO).",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Write Python code to import `deque`, enqueue 1,2,3, then dequeue one element.",
      },
    },
    // 18
    {
      group: "1",
      title: "Comparing Access Patterns",
      description: "Discuss random vs. sequential access trade-offs.",
      isText: true,
      question: {
        questionText:
          "Why are arrays good for random access but linked lists are not?",
      },
    },
    // 19
    {
      group: "1",
      title: "List Initialization",
      description: "Allocate a fixed-size list with default values.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText: "Write code to create a list of five zeros in Python.",
      },
    },
    // 20
    {
      group: "1",
      title: "Importance of Foundations",
      description: "Summarize key takeaways from Chapter 1.",
      isText: true,
      question: {
        questionText:
          "In two sentences, explain why understanding data-structure foundations (ADTs, complexity, memory layout) is crucial before diving into implementations.",
      },
    },
    // 21
    {
      group: "1",
      title: "Review With AI Conversation (optional)",
      isConversationReview: true,
      description: "Review the subjects you've answered",
      question: {
        questionText: "Let's chat about the questions we've worked on so far.",
        range: [10, 29],
      },
    },
    // 1
    {
      group: "2",
      title: "Memory Layout: Array vs. Linked List",
      description:
        "Compare how arrays and linked lists store elements in memory.",
      isMultipleChoice: true,
      question: {
        questionText: "Which statement correctly describes memory layout?",
        options: [
          "Arrays use node pointers scattered in memory",
          "Linked lists store elements contiguously",
          "Arrays store elements contiguously, linked lists use pointers",
          "Both use contiguous memory blocks",
        ],
        answer: [
          "Arrays store elements contiguously, linked lists use pointers",
        ],
      },
    },
    // 2
    {
      group: "2",
      title: "Access Time: Array Indexing vs. List Traversal",
      description: "Identify the time complexity of accessing vs. traversing.",
      isMultipleChoice: true,
      question: {
        questionText:
          "What are the time complexities for accessing the 𝑖ᵗʰ element?",
        options: [
          "Array: O(1), Linked List: O(n)",
          "Array: O(n), Linked List: O(1)",
          "Array: O(log n), Linked List: O(log n)",
          "Array: O(n), Linked List: O(n)",
        ],
        answer: ["Array: O(1), Linked List: O(n)"],
      },
    },
    // 3
    {
      group: "2",
      title: "Amortized Analysis of list.append()",
      description:
        "Recall the amortized time complexity of appending to a Python list.",
      isMultipleChoice: true,
      question: {
        questionText:
          "What is the amortized time complexity of `my_list.append(x)`?",
        options: ["O(1)", "O(n)", "O(log n)", "O(n²)"],
        answer: ["O(1)"],
      },
    },
    // 4
    {
      group: "2",
      title: "Dynamic Array Resizing Steps",
      description:
        "Order the steps Python’s list takes when resizing its capacity.",
      isSelectOrder: true,
      question: {
        questionText: "Arrange these internal steps when capacity is exceeded:",
        options: [
          "Copy old elements to new block",
          "Allocate new larger block",
          "Update internal pointer",
          "Free old block",
        ],
        answer: [
          "Allocate new larger block",
          "Copy old elements to new block",
          "Free old block",
          "Update internal pointer",
        ],
      },
    },
    // 5
    {
      group: "2",
      title: "List Append in Code",
      description: "Practice appending items and checking length.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Write Python code to create `nums = [1,2,3]`, append `4`, then print its length.",
      },
    },
    // 6
    {
      group: "2",
      title: "Linked List Insertion Complexity",
      description: "Identify insertion complexities at head and tail.",
      isMultipleChoice: true,
      question: {
        questionText: "What is the time complexity to insert:",
        options: [
          "At head: O(1), At tail (no pointer): O(n)",
          "At head: O(n), At tail: O(1)",
          "At head: O(1), At tail: O(1)",
          "At head: O(n), At tail: O(n)",
        ],
        answer: ["At head: O(1), At tail (no pointer): O(n)"],
      },
    },
    // 7
    {
      group: "2",
      title: "Building a Simple Linked List",
      description: "Link three nodes and print the second value.",
      isCodeCompletion: true,
      question: {
        questionText: "Complete code so `head.next.v` prints `2`:",
        options: [
          //# 1) Correct definition, linking, and print
          `class Node:
    def __init__(self, v):
        self.v = v
        self.next = None

head = Node(1)
second = Node(2)
third = Node(3)
# link
head.next = second
second.next = third

print(head.next.v)  # 2`,

          //# 2) `head` is never assigned (NameError)
          `class Node:
    def __init__(self, v):
        self.v = v
        self.next = None

n1 = Node(1)
second = Node(2)
third = Node(3)
# link
n1.next = second
second.next = third

print(head.next.v)  # 2`,

          // # 3) Linked to the wrong node (prints 3 instead of 2)
          `class Node:
    def __init__(self, v):
        self.v = v
        self.next = None

head = Node(1)
second = Node(2)
third = Node(3)
# incorrect link
head.next = third
third.next = second

print(head.next.v)  # 2`,

          //# 4) Using wrong attribute name (AttributeError)
          `class Node:
    def __init__(self, v):
        self.v = v
        self.next = None

head = Node(1)
second = Node(2)
third = Node(3)
# link
head.next = second
second.next = third

print(head.next.value)  # 2`,
        ],
        answer: `class Node:
    def __init__(self, v):
        self.v = v
        self.next = None

head = Node(1)
second = Node(2)
third = Node(3)
# link
head.next = second
second.next = third

print(head.next.v)  # 2`,
      },
    },
    // 8
    {
      group: "2",
      title: "Traversing a Linked List",
      description: "Write code to retrieve the 3rd element from a list.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Given `head` of a linked list, write a loop to print the 3rd node’s value.",
      },
    },
    // 9
    {
      group: "2",
      title: "Stack ADT Characteristics",
      description: "Identify the behavior of a stack.",
      isMultipleChoice: true,
      question: {
        questionText: "Which property defines a stack (LIFO)?",
        options: [
          "First In, First Out",
          "Last In, First Out",
          "Random Removal",
          "Priority Removal",
        ],
        answer: ["Last In, First Out"],
      },
    },
    // 10
    {
      group: "2",
      title: "Stack Implementation with list",
      description: "Complete push/pop methods using a Python list.",
      isCodeCompletion: true,
      question: {
        questionText: "Fill in methods so `push` and `pop` work correctly:",
        options: [
          `class Stack:
    def __init__(self):
        self.data = []
    def push(self, x):
        self.data.append(x)
    def pop(self):
        return self.data.pop()`,

          `class Stack:
    def __init__(self):
        self.data = []
    def push(self, x):
        self.data.append(x)
    def pop(self):
        return self.data.pop(0)`,

          `class Stack:
    def __init__(self):
        self.data = []
    def push(self, x):
        self.data.insert(0, x)
    def pop(self):
        return self.data.pop()`,

          `class Stack:
    def __init__(self):
        self.data = []
    def push(self, x):
        self.data.append(x)
    def pop(self):
        self.data.pop()`,
        ],
        answer: `class Stack:
    def __init__(self):
        self.data = []
    def push(self, x):
        self.data.append(x)
    def pop(self):
        return self.data.pop()`,
      },
    },
    // 11
    {
      group: "2",
      title: "Queue ADT Characteristics",
      description: "Identify the behavior of a queue.",
      isMultipleChoice: true,
      question: {
        questionText: "Which property defines a queue (FIFO)?",
        options: [
          "Last In, First Out",
          "First In, First Out",
          "Priority Insertion",
          "Random Access",
        ],
        answer: ["First In, First Out"],
      },
    },
    // 12
    {
      group: "2",
      title: "Queue Implementation with deque",
      description: "Use `collections.deque` for enqueue/dequeue.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Write code to:\n1. `from collections import deque`\n2. `q = deque()`\n3. `q.append(5)`\n4. `print(q.popleft())`",
      },
    },
    // 13
    {
      group: "2",
      title: "Comparing Append vs. Insert",
      description: "Contrast amortized append with linked-list insert.",
      isText: true,
      question: {
        questionText:
          "In two sentences, compare `list.append()` amortized O(1) vs. linked-list insertion at head.",
      },
    },
    // 14
    {
      group: "2",
      title: "Real-World Use of Stacks & Queues",
      description: "Reflect on practical applications.",
      isText: true,
      question: {
        questionText:
          "Give one real-world scenario each for using a stack and a queue.",
      },
    },
    // 15
    {
      group: "2",
      title: "Array vs. Linked List Trade-Offs",
      description: "Choose when to use each structure.",
      isMultipleChoice: true,
      question: {
        questionText: "Which scenario favors a linked list over an array?",
        options: [
          "Frequent random access",
          "Fixed-size buffer",
          "Frequent insertions/deletions at arbitrary positions",
          "Contiguous memory requirement",
        ],
        answer: ["Frequent insertions/deletions at arbitrary positions"],
      },
    },
    // 16
    {
      group: "2",
      title: "Implementing Stack via Linked List",
      description: "Use Node pointers to model a stack.",
      isCodeCompletion: true,
      question: {
        questionText: "Complete push and pop using a linked-list head pointer:",
        options: [
          `class Node:
    def __init__(self, v):
        self.v = v
        self.next = None

class Stack:
    def __init__(self):
        self.top = None

    def push(self, x):
        node = Node(x)
        node.next = self.top
        self.top = node

    def pop(self):
        val = self.top.v
        self.top = self.top.next
        return val`,

          `class Node:
    def __init__(self, v):
        self.v = v
        self.next = None

class Stack:
    def __init__(self):
        self.top = None

    def push(self, x):
        node = Node(x)
        node.next = self.top
        self.top = node

    def pop(self):
        val = self.top.v
        return val`,

          `class Node:
    def __init__(self, v):
        self.v = v
        self.next = None

class Stack:
    def __init__(self):
        self.top = None

    def push(self, x):
        node = Node(x)
        node.next = self.top
        self.top = node

    def pop(self):
        self.top = self.top.next
        return self.top.v`,

          `class Node:
    def __init__(self, v):
        self.v = v
        self.next = None

class Stack:
    def __init__(self):
        self.top = None

    def push(self, x):
        node = Node(x)
        self.top.next = node
        self.top = node

    def pop(self):
        val = self.top.v
        self.top = self.top.next
        return val`,
        ],
        answer: `class Node:
    def __init__(self, v):
        self.v = v
        self.next = None

class Stack:
    def __init__(self):
        self.top = None

    def push(self, x):
        node = Node(x)
        node.next = self.top
        self.top = node

    def pop(self):
        val = self.top.v
        self.top = self.top.next
        return val`,
      },
    },
    // 17
    {
      group: "2",
      title: "Implementing Queue via Linked List",
      description: "Use head/tail pointers to model a queue.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Write Python code to implement `enqueue(x)` at tail and `dequeue()` at head using Node and head/tail pointers.",
      },
    },
    // 18
    {
      group: "2",
      title: "Review With AI Conversation (optional)",
      isConversationReview: true,
      description: "Review the subjects you've answered",
      question: {
        questionText: "Let's chat about the questions we've worked on so far.",
        range: [31, 47],
      },
    },
    // 1
    {
      group: "3",
      title: "Hierarchical vs. Associative Structures",
      description:
        "Identify which of these are hierarchical versus associative data structures.",
      isMultipleChoice: true,
      question: {
        questionText:
          "Which of the following are hierarchical data structures?",
        options: ["Binary Tree", "Heap", "Hash Table", "Queue"],
        answer: ["Binary Tree", "Heap"],
      },
    },
    // 2
    {
      group: "3",
      title: "Associative Structures",
      description: "Identify which of these are associative data structures.",
      isMultipleChoice: true,
      question: {
        questionText: "Which of the following are associative data structures?",
        options: ["List", "Hash Table", "Stack", "Graph"],
        answer: ["Hash Table"],
      },
    },
    // 3
    {
      group: "3",
      title: "In-Order Traversal Sequence",
      description: "Order the steps of in-order traversal for a binary tree.",
      isSelectOrder: true,
      question: {
        questionText:
          "Arrange these actions in the correct order for in-order traversal:",
        options: ["Visit left subtree", "Visit node", "Visit right subtree"],
        answer: ["Visit left subtree", "Visit node", "Visit right subtree"],
      },
    },
    // 4
    {
      group: "3",
      title: "Pre-Order Traversal Implementation",
      description:
        "Fill in the blanks to implement pre-order traversal recursively.",
      isCodeCompletion: true,
      question: {
        questionText:
          "Complete the `preorder` function so it prints values in root-left-right order:",
        options: [
          `def preorder(node):
    if node is None:
        return
    print(node.value)
    preorder(node.left)
    preorder(node.right)`,

          `def preorder(node):
    if node is None:
        return
    preorder(node.left)
    print(node.value)
    preorder(node.right)`,

          `def preorder(node):
    if node is None:
        return
    preorder(node.right)
    print(node.value)
    preorder(node.left)`,
        ],
        answer: `def preorder(node):
    if node is None:
        return
    print(node.value)
    preorder(node.left)
    preorder(node.right)`,
      },
    },
    // 5
    {
      group: "3",
      title: "Post-Order Traversal",
      description: "Identify the sequence for post-order traversal.",
      isMultipleChoice: true,
      question: {
        questionText:
          "In post-order traversal, nodes are visited in which order?",
        options: [
          "Root, Left, Right",
          "Left, Right, Root",
          "Left, Root, Right",
          "Right, Left, Root",
        ],
        answer: "Left, Right, Root",
      },
    },
    // 6
    {
      group: "3",
      title: "Level-Order (Breadth-First) Traversal",
      description: "Write code to perform level-order traversal using a queue.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Given `root` of a binary tree, write a Python function `level_order(root)` that prints each level’s values using `collections.deque`.",
      },
    },
    // 7
    {
      group: "3",
      title: "Heap Property: Min vs. Max",
      description: "Distinguish min-heap and max-heap properties.",
      isMultipleChoice: true,
      question: {
        questionText: "Which property defines a min-heap?",
        options: [
          "Every parent ≥ its children",
          "Every parent ≤ its children",
          "Complete binary tree shape only",
          "Balanced tree only",
        ],
        answer: "Every parent ≤ its children",
      },
    },
    // 8
    {
      group: "3",
      title: "Using heapq: Push & Pop",
      description: "Practice using Python’s `heapq` to push and pop values.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Write code to import `heapq`, create a list `h = []`, push 5 and 2, then pop and print the smallest value.",
      },
    },
    // 9
    {
      group: "3",
      title: "Priority Queue Tuples",
      description: "Implement a priority queue with custom priorities.",
      isCodeCompletion: true,
      question: {
        questionText:
          "Complete code to push `(priority, task)` pairs so lowest priority is served first:",
        options: [
          `import heapq

pq = []
heapq.heappush(pq, (2, 'clean'))
heapq.heappush(pq, (1, 'cook'))
print(heapq.heappop(pq))  # (1, 'cook')`,

          `import heapq

pq = []
heapq.push(pq, (2, 'clean'))
heapq.push(pq, (1, 'cook'))
print(heapq.pop(pq))`,

          `import heapq

pq = []
heapq.heappush(pq, 'clean')
heapq.heappush(pq, 'cook')
print(heapq.heappop(pq))`,
        ],
        answer: `import heapq

pq = []
heapq.heappush(pq, (2, 'clean'))
heapq.heappush(pq, (1, 'cook'))
print(heapq.heappop(pq))  # (1, 'cook')`,
      },
    },
    // 10
    {
      group: "3",
      title: "Hash Table Collision Strategies",
      description: "Identify common collision-resolution methods.",
      isMultipleChoice: true,
      question: {
        questionText:
          "Which of the following are valid hash table collision-resolution strategies?",
        options: [
          "Separate chaining",
          "Open addressing",
          "Binary search",
          "Depth-first search",
        ],
        answer: ["Separate chaining", "Open addressing"],
      },
    },
    // 11
    {
      group: "3",
      title: "Python dict Operations",
      description: "Practice basic insert and lookup in a dict.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Write code to create `d = {}`, set `d['a']=1`, then print `d['a']`.",
      },
    },
    // 12
    {
      group: "3",
      title: "Load Factor Definition",
      description: "Explain the load factor in a hash table.",
      isSingleLineText: true,
      question: {
        questionText: "What is the load factor of a hash table?",
        placeholder: "Type your answer here...",
        answer: "Number of entries divided by number of buckets",
      },
    },
    // 13
    {
      group: "3",
      title: "Simple Hash Function",
      description: "Fill in a basic hash function using modulo arithmetic.",
      isCodeCompletion: true,
      question: {
        questionText:
          "Complete `hash_func` so it returns `sum(ord(c) for c in key) % size`:",
        options: [
          `def hash_func(key, size):
    return sum(ord(c) for c in key) % size`,

          `def hash_func(key, size):
    return len(key) % size`,

          `def hash_func(key, size):
    return key % size`,
        ],
        answer: `def hash_func(key, size):
    return sum(ord(c) for c in key) % size`,
      },
    },
    // 14
    {
      group: "3",
      title: "Open Addressing Loop",
      description: "Complete code for linear probing collision resolution.",
      isCodeCompletion: true,
      question: {
        questionText:
          "Fill in the `while` condition to probe next slot until an empty bucket:",
        options: [
          `def insert(table, key, size):
    idx = hash_func(key, size)
    while table[idx] is not None:
        idx = (idx + 1) % size
    table[idx] = key`,

          `def insert(table, key, size):
    idx = hash_func(key)
    if table[idx] is None:
        table[idx] = key`,

          `def insert(table, key, size):
    idx = hash_func(key, size)
    for i in range(size):
        table[idx] = key`,
        ],
        answer: `def insert(table, key, size):
    idx = hash_func(key, size)
    while table[idx] is not None:
        idx = (idx + 1) % size
    table[idx] = key`,
      },
    },
    // 15
    {
      group: "3",
      title: "Real-World Hash Use Case",
      description: "Reflect on practical applications of hash tables.",
      isText: true,
      question: {
        questionText:
          "Provide one real-world use case where a hash table improves performance.",
      },
    },
    // 16
    {
      group: "3",
      title: "Tree vs. Hash Table Lookup",
      description: "Compare lookup complexities in two structures.",
      isText: true,
      question: {
        questionText:
          "In two sentences, compare average-case lookup time for a hash table versus a balanced binary search tree.",
      },
    },
    // 17
    {
      group: "3",
      title: "Priority Queue Use Case",
      description: "Identify when to use a heap-based priority queue.",
      isMultipleChoice: true,
      question: {
        questionText: "Which scenario best uses a priority queue (min-heap)?",
        options: [
          "Scheduling tasks by priority",
          "Random element removal",
          "First-come, first-served queue",
          "Depth-first traversal",
        ],
        answer: ["Scheduling tasks by priority"],
      },
    },
    // 18
    {
      group: "3",
      title: "Review With AI Conversation (optional)",
      isConversationReview: true,
      description: "Review the subjects you've answered",
      question: {
        questionText: "Let's chat about the questions we've worked on so far.",
        range: [49, 67],
      },
    },
    // 1
    {
      group: "4",
      title: "What Is an Algorithm?",
      description: "Define core concepts of algorithms and complexity.",
      isText: true,
      question: {
        questionText:
          "In your own words, what is an algorithm and why is time complexity important when evaluating one?",
      },
    },
    // 2
    {
      group: "4",
      title: "Comparison Sorts Complexity Ordering",
      description:
        "Order common comparison sorts by average-case time complexity.",
      isSelectOrder: true,
      question: {
        questionText:
          "Arrange these sorting algorithms from lowest (fastest) to highest (slowest) average-case complexity:",
        options: [
          "Bubble Sort (O(n²))",
          "Insertion Sort (O(n²))",
          "Merge Sort (O(n log n))",
          "Quick Sort (O(n log n))",
        ],
        answer: [
          "Merge Sort (O(n log n))",
          "Quick Sort (O(n log n))",
          "Bubble Sort (O(n²))",
          "Insertion Sort (O(n²))",
        ],
      },
    },
    // 3
    {
      group: "4",
      title: "Bubble Sort Implementation",
      description: "Write a basic bubble sort in Python.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Write a Python function `bubble_sort(arr)` that sorts `arr` in-place using bubble sort.",
      },
    },
    // 4
    {
      group: "4",
      title: "Insertion Sort Implementation",
      description: "Write a basic insertion sort in Python.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Write a Python function `insertion_sort(arr)` that sorts `arr` in-place using insertion sort.",
      },
    },
    // 5
    {
      group: "4",
      title: "Merge Sort Code Completion",
      description: "Fill in missing steps of merge sort.",
      isCodeCompletion: true,
      question: {
        questionText:
          "Complete the Python `merge_sort` function so it correctly splits and merges:",
        options: [
          `def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] < right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result`,

          `def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] < right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result`,

          `def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] < right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    result.extend(left[i:])
    return result`,

          `def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] < right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    result.extend(right[j:])
    return result`,
        ],
        answer: `def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] < right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result`,
      },
    },
    // 6
    {
      group: "4",
      title: "Quick Sort Partition",
      description: "Implement the Lomuto partition scheme.",
      isCodeCompletion: true,
      question: {
        questionText: "Fill in the `partition` function for quick sort:",
        options: [
          `def partition(arr, low, high):
    pivot = arr[high]
    i = low - 1
    for j in range(low, high):
        if arr[j] <= pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    arr[i+1], arr[high] = arr[high], arr[i+1]
    return i+1`,

          `def partition(arr, low, high):
    pivot = arr[high]
    i = low - 1
    for j in range(low, high):
        if arr[j] <= pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    return i+1`,

          `def partition(arr, low, high):
    pivot = arr[low]
    i = low - 1
    for j in range(low, high):
        if arr[j] <= pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    arr[i+1], arr[high] = arr[high], arr[i+1]
    return i+1`,

          `def partition(arr, low, high):
    pivot = arr[high]
    i = low - 1
    for j in range(low, high):
        if arr[j] < pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    arr[i+1], arr[high] = arr[high], arr[i+1]
    return i+1`,

          `def partition(arr, low, high):
    pivot = arr[high]
    i = low
    for j in range(low, high):
        if arr[j] <= pivot:
            arr[i], arr[j] = arr[j], arr[i]
            i += 1
    arr[i], arr[high] = arr[high], arr[i]
    return i`,
        ],
        answer: `def partition(arr, low, high):
    pivot = arr[high]
    i = low - 1
    for j in range(low, high):
        if arr[j] <= pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    arr[i+1], arr[high] = arr[high], arr[i+1]
    return i+1`,
      },
    },
    // 7
    {
      group: "4",
      title: "Sorting Stability",
      description: "Understand stable vs. unstable sorts.",
      isMultipleChoice: true,
      question: {
        questionText: "Which of these sorting algorithms are stable?",
        options: ["Bubble Sort", "Quick Sort", "Merge Sort", "Insertion Sort"],
        answer: ["Bubble Sort", "Merge Sort", "Insertion Sort"],
      },
    },
    // 8
    {
      group: "4",
      title: "Binary Search Precondition",
      description: "Identify the primary requirement for binary search.",
      isMultipleChoice: true,
      question: {
        questionText:
          "Which precondition must hold true before performing a binary search on an array?",
        options: [
          "Array must be sorted",
          "Array must contain unique elements",
          "Array must be linked-list",
          "Array must be in contiguous memory",
        ],
        answer: "Array must be sorted",
      },
    },
    // 9
    {
      group: "4",
      title: "Binary Search Steps",
      description: "Order the core steps of the binary search algorithm.",
      isSelectOrder: true,
      question: {
        questionText:
          "Arrange these steps in the order a binary search would perform them:",
        options: [
          "Compare target to middle element",
          "Adjust low/high bounds",
          "Return index if match",
          "Compute middle index",
        ],
        answer: [
          "Compute middle index",
          "Compare target to middle element",
          "Return index if match",
          "Adjust low/high bounds",
        ],
      },
    },
    // 10
    {
      group: "4",
      title: "Implementing Binary Search",
      description: "Write an iterative binary search in Python.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Write a Python function `binary_search(arr, target)` that returns the index of `target` or -1 if not found.",
      },
    },
    // 11
    {
      group: "4",
      title: "Divide-and-Conquer Pattern",
      description: "Explain the divide-and-conquer strategy in algorithms.",
      isText: true,
      question: {
        questionText:
          "In two sentences, explain how the divide-and-conquer approach is used in merge sort and quick sort.",
      },
    },
    // 12
    {
      group: "4",
      title: "BFS vs. DFS",
      description: "Distinguish breadth-first from depth-first traversal.",
      isMultipleChoice: true,
      question: {
        questionText: "Which traversal explores neighbors level by level?",
        options: [
          "Depth-First Search (DFS)",
          "Breadth-First Search (BFS)",
          "Binary Search",
          "Merge Sort",
        ],
        answer: "Breadth-First Search (BFS)",
      },
    },
    // 13
    {
      group: "4",
      title: "DFS Recursive Implementation",
      description: "Write a recursive depth-first search on a graph.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Given `graph` as adjacency dict, write `def dfs(node, visited): …` that prints each node once.",
      },
    },
    // 14
    {
      group: "4",
      title: "BFS Iterative Implementation",
      description: "Use a queue for breadth-first search.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Write a Python `bfs(start)` that uses `collections.deque` to traverse `graph` level by level.",
      },
    },
    // 15
    {
      group: "4",
      title: "Graph Representation",
      description: "Choose a graph representation format.",
      isSingleLineText: true,
      question: {
        questionText:
          "Which Python data structure best represents a sparse graph?",
        placeholder: "Type your answer here...",
        answer: "Adjacency list",
      },
    },
    // 16
    {
      group: "4",
      title: "Traversal Complexity",
      description: "Identify time complexity of BFS/DFS.",
      isMultipleChoice: true,
      question: {
        questionText:
          "What is the time complexity of BFS or DFS on a graph with V vertices and E edges?",
        options: ["O(V + E)", "O(V²)", "O(E log V)", "O(V + E log V)"],
        answer: "O(V + E)",
      },
    },
    // 17
    {
      group: "4",
      title: "Priority Queue for Dijkstra",
      description: "Use `heapq` in Dijkstra’s algorithm.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Write Python code to import `heapq`, push `(0, start)`, pop the smallest distance.",
      },
    },
    // 18
    {
      group: "4",
      title: "Dijkstra Steps Ordering",
      description: "Arrange the high-level steps of Dijkstra’s algorithm.",
      isSelectOrder: true,
      question: {
        questionText: "Arrange these Dijkstra steps in order:",
        options: [
          "Initialize distances",
          "Extract min-distance node",
          "Relax its edges",
          "Repeat until all nodes visited",
        ],
        answer: [
          "Initialize distances",
          "Extract min-distance node",
          "Relax its edges",
          "Repeat until all nodes visited",
        ],
      },
    },
    // 19
    {
      group: "4",
      title: "Implementing Dijkstra Relaxation",
      description: "Fill in the relaxation step inside Dijkstra’s loop.",
      isCodeCompletion: true,
      question: {
        questionText: "Complete the Python code to relax edges:",
        options: [
          `dist_u = dist[current]
for neighbor, weight in graph[current]:
    if dist_u + weight < dist[neighbor]:
        dist[neighbor] = dist_u + weight
        heapq.heappush(pq, (dist[neighbor], neighbor))`,

          `dist_u = dist[current]
for neighbor, weight in graph[current]:
    if dist_u + weight < dist[neighbor]:
        dist[neighbor] = dist_u + weight
        # forgot to push to the queue`,

          `dist_u = dist[current]
for neighbor, weight in graph[current]:
    if dist_u + weight <= dist[neighbor]:
        dist[neighbor] = dist_u + weight
        heapq.heappush(pq, (dist[neighbor], neighbor))`,

          `dist_u = dist[neighbor]
for neighbor, weight in graph[current]:
    if dist_u + weight < dist[neighbor]:
        dist[neighbor] = dist_u + weight
        heapq.heappush(pq, (dist[neighbor], neighbor))`,

          `dist_u = dist[current]
for neighbor, weight in graph[current]:
    if dist_u + weight < dist[neighbor]:
        dist[neighbor] = dist_u + weight
        heapq.heappush(pq, (neighbor, dist[neighbor]))`,
        ],
        answer: `dist_u = dist[current]
for neighbor, weight in graph[current]:
    if dist_u + weight < dist[neighbor]:
        dist[neighbor] = dist_u + weight
        heapq.heappush(pq, (dist[neighbor], neighbor))`,
      },
    },
    // 20
    {
      group: "4",
      title: "Real-World Graph Use Case",
      description: "Reflect on graph algorithm applications.",
      isText: true,
      question: {
        questionText:
          "Describe one real-world problem that can be solved using BFS, DFS, or Dijkstra’s algorithm.",
      },
    },
    // 21
    {
      group: "4",
      title: "Graph Construction in Code",
      description: "Build a graph adjacency list from edge list.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Given `edges = [(0,1),(1,2),(2,0)]`, write code to build `graph` as `{0:[1],1:[2],2:[0]}`.",
      },
    },
    // 22
    {
      group: "4",
      title: "Review With AI Conversation (optional)",
      isConversationReview: true,
      description: "Review the subjects you've answered",
      question: {
        questionText: "Let's chat about the questions we've worked on so far.",
        range: [69, 89],
      },
    },
    // 1
    {
      group: "5",
      title: "Processes vs. Threads",
      description: "Distinguish processes from threads in an operating system.",
      isMultipleChoice: true,
      question: {
        questionText:
          "Which statement correctly differentiates a process from a thread?",
        options: [
          "A process shares memory with other processes; a thread has its own memory",
          "A process has its own memory space; threads within a process share memory",
          "Threads run independently of the OS; processes require kernel scheduling",
          "Processes are lighter weight than threads",
        ],
        answer: [
          "A process has its own memory space; threads within a process share memory",
        ],
      },
    },
    // 2
    {
      group: "5",
      title: "Scheduling Policies Ordering",
      description:
        "Order common CPU scheduling policies by their typical response time fairness.",
      isSelectOrder: true,
      question: {
        questionText:
          "Arrange these scheduling policies from most fair (each process gets time) to least fair:",
        options: [
          "Round Robin",
          "First-Come, First-Served (FCFS)",
          "Shortest Job Next",
          "Priority Scheduling",
        ],
        answer: [
          "Round Robin",
          "Shortest Job Next",
          "FCFS",
          "Priority Scheduling",
        ],
      },
    },
    // 3
    {
      group: "5",
      title: "Context Switching Steps",
      description:
        "Order the high-level steps the OS takes during a context switch.",
      isSelectOrder: true,
      question: {
        questionText:
          "Arrange these actions in the order performed during a context switch:",
        options: [
          "Save current CPU registers to PCB",
          "Load next process’s registers from PCB",
          "Update scheduler data structures",
          "Jump to the next process’s instruction pointer",
        ],
        answer: [
          "Save current CPU registers to PCB",
          "Update scheduler data structures",
          "Load next process’s registers from PCB",
          "Jump to the next process’s instruction pointer",
        ],
      },
    },
    // 4
    {
      group: "5",
      title: "Memory Management Overview",
      description: "Explain why an OS needs to manage memory.",
      isText: true,
      question: {
        questionText:
          "In your own words, why does an operating system use memory management (e.g., paging, segmentation)?",
      },
    },
    // 5
    {
      group: "5",
      title: "Paging Definition",
      description: "Identify the core concept of paging.",
      isMultipleChoice: true,
      question: {
        questionText: "What does paging in memory management refer to?",
        options: [
          "Dividing physical memory into fixed-size frames",
          "Grouping processes into pages for scheduling",
          "Loading entire processes into contiguous memory",
          "Swapping registers between processes",
        ],
        answer: ["Dividing physical memory into fixed-size frames"],
      },
    },
    // 6
    {
      group: "5",
      title: "Segmentation Definition",
      description: "Identify the core concept of segmentation.",
      isMultipleChoice: true,
      question: {
        questionText: "What is memory segmentation?",
        options: [
          "Combining multiple pages into one segment",
          "Dividing memory into variable-sized logical segments",
          "Allocating fixed-size frames to segments",
          "Swapping entire segments between disk and RAM",
        ],
        answer: ["Dividing memory into variable-sized logical segments"],
      },
    },
    // 7
    {
      group: "5",
      title: "Virtual Memory Benefits",
      description: "Reflect on why virtual memory is useful.",
      isText: true,
      question: {
        questionText:
          "List two benefits that virtual memory provides to applications and the OS.",
      },
    },
    // 8
    {
      group: "5",
      title: "Page Replacement Algorithms",
      description:
        "Order common page-replacement strategies by their eviction policy.",
      isSelectOrder: true,
      question: {
        questionText: "Arrange these algorithms by which page they evict:",
        options: [
          "FIFO (First-In, First-Out)",
          "LRU (Least Recently Used)",
          "Optimal (theoretical best)",
          "Clock (second-chance)",
        ],
        answer: [
          "FIFO (First-In, First-Out)",
          "Clock (second-chance)",
          "LRU (Least Recently Used)",
          "Optimal (theoretical best)",
        ],
      },
    },
    // 9
    {
      group: "5",
      title: "File Descriptor Basics",
      description:
        "Identify the role of file descriptors in UNIX-like systems.",
      isSingleLineText: true,
      question: {
        questionText:
          "What integer values are typically used for standard input, output, and error file descriptors?",
        placeholder: "Type your answer here...",
        answer: "0, 1, and 2",
      },
    },
    // 10
    {
      group: "5",
      title: "File Buffering Layers",
      description: "Select which layers buffer file I/O operations.",
      isMultipleChoice: true,
      question: {
        questionText:
          "Which of the following buffer data during file operations?",
        options: [
          "Application-level buffers (e.g., stdio)",
          "OS page cache",
          "Disk controller cache",
          "CPU register cache",
        ],
        answer: [
          "Application-level buffers (e.g., stdio)",
          "OS page cache",
          "Disk controller cache",
        ],
      },
    },
    // 11
    {
      group: "5",
      title: "Device Types",
      description: "Distinguish block devices from character devices.",
      isMultipleChoice: true,
      question: {
        questionText:
          "Which of the following are block devices versus character devices?",
        options: [
          "Hard disk (block)",
          "Serial port (char)",
          "Keyboard (char)",
          "USB mass storage (block)",
        ],
        answer: [
          "Hard disk (block)",
          "USB mass storage (block)",
          "Serial port (char)",
          "Keyboard (char)",
        ],
      },
    },
    // 12
    {
      group: "5",
      title: "System Call Sequence",
      description: "Order the steps when making a file read system call.",
      isSelectOrder: true,
      question: {
        questionText: "Arrange these steps for `read()` system call:",
        options: [
          "User process invokes read() in libc",
          "Mode switch to kernel",
          "Kernel locates file and copies data",
          "Mode switch back to user",
        ],
        answer: [
          "User process invokes read() in libc",
          "Mode switch to kernel",
          "Kernel locates file and copies data",
          "Mode switch back to user",
        ],
      },
    },
    // 13
    {
      group: "5",
      title: "Reading a File in Python",
      description: "Practice file I/O with Python’s built-in functions.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Write Python code to open `data.txt`, read its contents into a string, and close the file.",
      },
    },
    // 14
    {
      group: "5",
      title: "File Permissions Overview",
      description: "Explain how UNIX file permissions work.",
      isText: true,
      question: {
        questionText:
          "Describe the three permission types (r, w, x) and who (owner, group, others) they apply to.",
      },
    },
    // 15
    {
      group: "5",
      title: "Caching Strategies",
      description: "Select common caching strategies used by OS and hardware.",
      isMultipleChoice: true,
      question: {
        questionText: "Which of these are caching strategies?",
        options: [
          "Write-back",
          "Write-through",
          "Write-around",
          "Write-behind",
        ],
        answer: ["Write-back", "Write-through", "Write-around"],
      },
    },
    // 16
    {
      group: "5",
      title: "Mounting Filesystems",
      description: "Understand how filesystems are mounted in UNIX.",
      isText: true,
      question: {
        questionText:
          "In one sentence, explain what the `mount` command does in UNIX-like systems.",
      },
    },
    // 17
    {
      group: "5",
      title: "Syscall vs Library Call",
      description:
        "Differentiate system calls from library (user-space) calls.",
      isSingleLineText: true,
      question: {
        questionText:
          "What is the main difference between a system call and a standard library call?",
        placeholder: "Type your answer here...",
        answer:
          "System calls transition to kernel mode; library calls stay in user mode",
      },
    },
    // 18
    {
      group: "5",
      title: "Memory Protection Mechanisms",
      description: "Identify mechanisms the OS uses to protect process memory.",
      isMultipleChoice: true,
      question: {
        questionText:
          "Which features help protect one process’s memory from another?",
        options: [
          "Virtual memory paging",
          "Segmentation",
          "Address Space Layout Randomization (ASLR)",
          "Process context switches",
        ],
        answer: [
          "Virtual memory paging",
          "Segmentation",
          "Address Space Layout Randomization (ASLR)",
        ],
      },
    },
    // 19
    {
      group: "5",
      title: "Journaling File Systems",
      description: "Explain why journaling helps file-system reliability.",
      isText: true,
      question: {
        questionText:
          "In two sentences, describe how journaling in a file system prevents data corruption after a crash.",
      },
    },
    // 20
    {
      group: "5",
      title: "OS Logging Facilities",
      description: "Understand how the OS logs events and errors.",
      isText: true,
      question: {
        questionText:
          "Name a common operating system logging facility and what it’s used for.",
      },
    },
    // 21
    {
      group: "5",
      title: "Review With AI Conversation (optional)",
      isConversationReview: true,
      description: "Review the subjects you've answered",
      question: {
        questionText: "Let's chat about the questions we've worked on so far.",
        range: [91, 110],
      },
    },
  ],
  en: [
    {
      group: "introduction",
      title: "Introduction To Software Development",
      isStudyGuide: true,
      description:
        "Expose yourself to fundamentals to improve the quality of your learning before making progress.",
      question: {
        questionText: (
          <div>
            <p style={{ marginBottom: 12 }}>
              {" "}
              One of the best predictors for student success is exposure to
              course material before studying it. You're encouraged to read
              about the fundamentals of software in the study guide before
              starting. You can reference this study guide in the menu
              throughout your progress too.
            </p>

            <p style={{ marginBottom: 12 }}>
              Remember to fail faster and fail forward! The real education
              happens when you push through a challenge. We'll start off nice
              and easy at first, but then we'll start to level up the difficulty
              as you collect more progress. Make sure to use the tools at your
              disposal! You're going to need it.
            </p>
          </div>
        ),
        metaData: `### Advice
  I know this looks like ChatGPT content... 

  but it's not -_-" It's me!

  It's important to remember this as a beginner:

  1. Building things with software is mostly about organizing information rather than being good at math. Programming languages use logic and computation to express ideas instead of equations and algebra.

  2. Like the English language, you can express things in many different ways.

  3. When something challenges you, fail faster and break the problem into more understandable steps.


  ### Exposure
  The idea here is to expose you to concepts before you start to answer questions about it in the app so you aren't intimidated by it later. Don't worry about not understanding everything. In fact, try your best to make sense out of it at a glance or use AI to your advantage to create an understanding.

  ### Code

  Let's observe these lists. We can see that:
  - \`my_custom_data && my_custom_list\` are equivalent.
  - \`data_set && data_object\` are also fundamentally equivalent.


  \`\`\`js
  let my_custom_data = [1, 2, 3, 'a', 'b', 'c', null, false]
  const my_custom_list = new Array(1,2,3,'a','b','c', null, false)
  my_custom_data.push('new data')
  my_custom_list.push('new data')

  let data_set = {
    introduction: "Welcome",
    title: "Chapter 1",
    is_live: true
  }
  data_set.page = 4
  data_set['book'] = 'Coding Basics'

  let data_object = new Object()
  data_object.introduction = 'Welcome'
  data_object.title = 'Chapter 1'
  data_object.is_live = true
  data_object.page = 4
  data_object['book'] = 'Coding Basics'

  \`\`\`

  Additionally, in the example above, we're exposed to variable definitions, data types, arrays, functions and objects. A lot of the software that you likely operates on those concepts under the hood. This is way \`[]\` and \`new Array\` can create the same data - it translates the same way when it comes to turning your code into signals that can be sent across the internet.

  Now in the example below, we take a look at creating our own custom objects. We create our own custom object, along with an interface of functions. Generally when it comes to data, you're able to create, retrieve, update or delete it in some form or another.

  \`\`\`js
  class House {
    house_paint = null

    constructor(paint){
      this.house_paint = paint
    }

    getPaint(){
      return this.house_paint
    }

    setPaint(paint) = (paint) => {
      this.house_paint = paint
    }

    deletePaint = () => {
      this.house_paint = null
    }
  }

  let first_home = new House("pink")
  let next_home = new House("blue")

  let first_paint = first_house.getPaint() // returns the value "pink"
  let next_paint = new_home.house_paint // returns the value "blue"
  next_paint = new_home['house_paint'] // still returns the value 'blue'

  \`\`\`

  So that's creating data and working with data. You'll find that you can usually combine ideas depending on what you need to create. For example, the above component can also be written the following way:

  \`\`\`js
  function createHouse(paint = null) {
    return {
      house_paint: paint,

      getPaint() {
        return this.house_paint;
      },

      setPaint(paint) {
        this.house_paint = paint;
      },

      deletePaint() {
        this.house_paint = null;
      },
    };
  }

  //what is the value of the result by the end of the program?
  const myHouse = createHouse('blue');
  let paint = myHouse.house_paint;

  myHouse.house_paint = 'red'; 
  paint = myHouse.getPaint()

  myHouse.setPaint('green'); 
  paint = myHouse.house_paint

  myHouse.deletePaint(); 

  let result = myHouse['house_paint']
  \`\`\`


  Finally, we combine this to work with some code that renders the following screen
  \`\`\`jsx
  const CelebrationMessage = ({ name }) => {
    const styling_data = {
      textAlign: 'center'
    }
    
    return <div style={styling_data}>{name}</div>
  }

  const App = () => {
    return (
      <section style={{ border: '3px solid black' }}>
        <header>
          <h2>Good job!</h2>
        </header>
        
        <CelebrationMessage name="You created a small app!" />
      </section>
    )
  }
  \`\`\`


  And that's all! In the last example, we've used a library called React, which gives us access to special functions that are specialized for rendering elements on a screen. But it follows the same thought process as the stuff before it.

  ### Conclusion
  Remember that failing faster is in your best interest when learning new skills with software. This one pager document will be available inside of the app. There are also many other features to help your journey along the way, but I'll leave that to your exploration of the platform and everything it has to offer.

  Stay focused and best of luck with the rest!

          `,
      },
    },
    //     {
    //   group: "tutorial",
    //   title: "Writing Effective Prompts",
    //   description: "Learn to craft AI prompts that get the right answer.",
    //   isPromptWriting: true,
    //   question: {
    //     questionText:
    //       "Write a prompt that asks the AI to summarize your day in three bullet points.",
    //     // you could optionally include a rubric or example in metadata
    //     metaData: {
    //       rubric: "Great prompts are clear about: task, format, length, tone.",
    //     },
    //   },
    // },
    {
      group: "tutorial",
      title: "Understanding Coding",
      description: "Grasp the basic concept of coding.",
      isMultipleChoice: true,
      // isMultipleAnswerChoice: true,
      question: {
        questionText: "Which of the following best describes coding?",
        options: [
          "Writing instructions for computers to perform tasks",
          "Creating physical components for computers",
          "Designing user interfaces",
          "Managing databases",
        ],
        answer: "Writing instructions for computers to perform tasks",
      },
    },
    {
      group: "tutorial",
      title: "Sequence of Program Execution",
      description: "Learn the correct order of program execution.",
      isSelectOrder: true,
      question: {
        questionText:
          "Arrange the steps with drag-and-drop and order how programs execute.",
        options: [
          "Code Compilation",
          "Writing Code",
          "Executing Program",
          "Debugging",
        ],
        answer: [
          "Writing Code",
          "Code Compilation",
          "Debugging",
          "Executing Program",
        ],
      },
    },
    {
      group: "tutorial",
      title: "Introduction to Variables",
      description:
        "In this step, you will learn about variables and how to use them in your code.",
      isMultipleAnswerChoice: true,
      question: {
        questionText:
          "Select all the steps involved in correctly declaring a variable in JavaScript:",
        options: [
          "Use the var/let/const keyword",
          "Choose a descriptive variable name",
          "Assign a value using the single equals sign (=)",
          "Initialize the variable inside curly braces {}",
          "Declare the variable after assigning a value",
          "Capitalize the first letter of the variable name",
        ],
        answer: [
          "Use the var/let/const keyword",
          "Choose a descriptive variable name",
          "Assign a value using the single equals sign (=)",
        ],
      },
    },
    {
      group: "tutorial",
      title: "Understanding Variable Declarations for Lists",
      description:
        "Complete the code by selecting the correct way to declare a array of items (array) in JavaScript.",
      isCodeCompletion: true,
      question: {
        questionText: "Which code block correctly declares a list of items?",
        options: [
          // Option 1: Correct array declaration

          // Option 2: Function returning a string
          `const items = function() {
  return 'apple, banana, cherry';
};`,

          // Option 3: Single string of items
          `const items = 'apple, banana, cherry';`,

          // Option 4: Object with key-value pairs
          `const items = {
  fruit1: 'apple',
  fruit2: 'banana',
  fruit3: 'cherry'
};`,

          // Option 5: Class that stores items as properties
          `class Items {
  constructor() {
    this.fruit1 = 'apple';
    this.fruit2 = 'banana';
    this.fruit3 = 'cherry';
  }
}
const items = new Items();`,
          `const items = ['apple', 'banana', 'cherry'];`,
        ],
        answer: `const items = ['apple', 'banana', 'cherry'];`,
      },
    },
    {
      group: "tutorial",
      title: "Variable Declaration in JavaScript",
      description: "Learn how to declare variables in JavaScript.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Declare a variable named `age` and assign it the value `25`.",
      },
    },
    {
      group: "tutorial",
      title: "Understanding Data Types",
      description: "Learn the basics of data types in JavaScript.",
      isSingleLineText: true,
      question: {
        questionText:
          "What keyword is used to declare a constant in JavaScript?",
        placeholder: "Type your answer here...",
        answer: "const",
      },
    },
    {
      group: "tutorial",
      title: "Purpose of Variables",
      description: "Understand why variables are used in programming.",
      isText: true,
      question: {
        questionText:
          "In your own words, explain the purpose of variables in programming.",
      },
    },
    {
      group: "tutorial",
      title: "Bash Terminal Practice: Changing Directories",
      description: "Practice changing directories in a terminal environment.",
      isCode: true,
      isTerminal: true,
      question: {
        questionText:
          "Enter the command to change to the new_folder directory using a bash terminal",
      },
    },
    {
      group: "tutorial",
      title: "Review With AI Conversation (optional)",
      isConversationReview: true,
      description: "Review the subjects you've answered",
      question: {
        questionText: "Let's chat about the questions we've worked on so far.",
        range: [1, 8], // Indices of steps to review
      },
    },

    // Cycle 2 (No Terminal)
    {
      group: "1",
      title: "Data Types in Programming",
      description:
        "Identify different primitive data types used in JavaScript.",
      isMultipleAnswerChoice: true,
      question: {
        questionText:
          "Which of the following are primitive data types in JavaScript?",
        options: [
          "String",
          "Function",
          "Number",
          "Object",
          "Boolean",
          "Null",
          "Array",
          "BigInt",
          "Undefined",
          "Symbol",
        ],
        answer: [
          "String",
          "Number",
          "Boolean",
          "Null",
          "Undefined",
          "Symbol",
          "BigInt",
        ],
      },
    },

    {
      group: "1",
      title: "Steps to Create a Function",
      description: "Understand the sequence of creating a function.",
      isSelectOrder: true,
      question: {
        questionText:
          "Arrange the steps with drag-and-drop to create and use a function.",
        options: [
          "Define the function",
          "Call the function",
          "Execute the function body",
          "Return a value",
        ],
        answer: [
          "Define the function",
          "Call the function",
          "Execute the function body",
          "Return a value",
        ],
      },
    },
    {
      group: "1",
      title: "Writing a Simple Function",
      description: "Practice writing functions in JavaScript.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Write a function named `greet` that takes a name as a parameter and logs a greeting with the name.",
      },
    },
    {
      group: "1",
      title: "Functions in Programming",
      description: "Discuss the role of functions.",
      isText: true,
      question: {
        questionText:
          "What is a function, and why is it useful in programming?",
      },
    },
    // Cycle 3 with Terminal
    {
      group: "1",
      title: "Conditional Statements",
      description: "Identify the purpose of conditional statements.",
      isMultipleChoice: true,
      question: {
        questionText: "What is the primary purpose of an `if` statement?",
        options: [
          "To repeat a block of code multiple times",
          "To execute a block of code based on a condition",
          "To define a variable",
          "To import external libraries",
        ],
        answer: "To execute a block of code based on a condition",
      },
    },
    {
      group: "1",
      title: "Order of Conditional Checks",
      description: "Complete the code that evaluates an `if-else` statement.",
      isCodeCompletion: true,
      question: {
        questionText:
          "Complete the following code to correctly implement an `if-else` statement that checks if a variable `x` is greater than 10, equal to 10, or less than 10.",
        options: [
          // Option 1: Partially complete if-else statement
          "if (x > 10) { \n  console.log('x is greater than 10'); \n} else if (x === 10) { \n  console.log('x is equal to 10'); \n} else { \n  console.log('x is less than 10'); \n}",

          // Option 2: Incorrect use of equality and missing else block
          "if (x == 10) { \n  console.log('x is equal to 10'); \n} else if (x > 10) { \n  console.log('x is greater than 10'); \n}",

          // Option 3: Missing else-if statement
          "if (x > 10) { \n  console.log('x is greater than 10'); \n} else { \n  console.log('x is not greater than 10'); \n}",

          // Option 4: Incorrect use of conditions
          "if (x >= 10) { \n  console.log('x is greater than or equal to 10'); \n} else { \n  console.log('x is less than 10'); \n}",

          // Option 5: Correct but over-complicated code with nested ifs
          "if (x > 10) { \n  console.log('x is greater than 10'); \n  if (x === 10) { \n    console.log('x is equal to 10'); \n  } \n} else { \n  console.log('x is less than 10'); \n}",
        ],
        answer:
          "if (x > 10) { \n  console.log('x is greater than 10'); \n} else if (x === 10) { \n  console.log('x is equal to 10'); \n} else { \n  console.log('x is less than 10'); \n}",
      },
    },
    {
      group: "1",
      title: "Implementing Conditional Logic",
      description: "Apply conditional logic in code.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Write an `if-else` statement that checks if a number `num` is positive, negative, or zero, and logs an appropriate message.",
      },
    },

    {
      group: "1",
      title: "Understanding Conditional Logic in Programming",
      description:
        "Learn how logical operators like AND (&&) and OR (||) control conditions in programming.",
      isSingleLineText: true,
      question: {
        questionText:
          "Which logical operator is used to check if both conditions in a conditional statement are true?",
        placeholder: "Type your answer here...",
        answer: "&&",
      },
    },
    {
      group: "1",
      title: "Real-world Use of Conditionals",
      description: "Reflect on how conditionals are used.",
      isText: true,
      question: {
        questionText:
          "Provide an example of how conditional statements are used in real-world applications.",
      },
    },
    {
      group: "1",
      title: "Terminal Practice: Help Command",
      description: "Write the help command to observe basic commands.",
      isCode: true,
      isTerminal: true,
      question: {
        questionText:
          "In a Bash terminal environment, enter the help command to discover basic commands.",
      },
    },
    // Cycle 4 (No Terminal)
    {
      group: "1",
      title: "Loops in Programming",
      description: "Understand the purpose of loops.",
      isMultipleChoice: true,
      question: {
        questionText:
          "Which loop will continue executing as long as its condition remains true?",
        options: ["for loop", "while loop", "do...while loop", "foreach loop"],
        answer: "while loop",
      },
    },
    {
      group: "1",
      title: "Sequence of Loop Execution",
      description: "Grasp the order in which loops execute.",
      isSelectOrder: true,
      question: {
        questionText:
          "Arrange the steps of a `for` loop execution with drag-and-drop.",
        options: [
          "Initialization",
          "Condition Check",
          "Execution of Code Block",
          "Increment/Decrement",
        ],
        answer: [
          "Initialization",
          "Condition Check",
          "Execution of Code Block",
          "Increment/Decrement",
        ],
      },
    },
    {
      group: "1",
      title: "Creating a Loop",
      description: "Practice writing loops.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText: "Write a `for` loop that prints numbers from 1 to 5.",
      },
    },
    //next lecture
    {
      group: "1",
      title: "Applications of Loops",
      description: "Discuss where loops are useful.",
      isText: true,
      question: {
        questionText:
          "Describe a scenario in software development where loops are essential.",
      },
    },
    // Cycle 5 with Terminal
    {
      group: "1",
      title: "Arrays in JavaScript",
      description:
        "Identify methods used for manipulating arrays in JavaScript.",
      isMultipleAnswerChoice: true,
      question: {
        questionText:
          "Which of the following methods are valid for manipulating arrays in JavaScript?",
        options: [
          ".includes()",
          ".push()",
          ".pop()",
          ".forEach()",
          ".length()",
          ".map()",
          ".filter()",
          ".join()",
        ],
        answer: [".push()", ".pop()", ".map()", ".filter()", ".join()"],
      },
    },
    {
      group: "1",
      title: "Order of Array Operations",
      description: "Understand how array operations are performed.",
      isCodeCompletion: true,
      question: {
        questionText:
          "Complete the code to declare an array, add an element to it, remove the last element, and then access an element.",
        options: [
          // Option 1: Correctly completes all steps

          // Option 2: Incorrect placement of push and pop
          "let fruits = ['apple', 'banana']; \nfruits.pop(); \nfruits.push('pink'); \nconsole.log(fruits[0]);",

          // Option 3: Incorrect array declaration
          "var fruits = 'apple', 'banana'; \nfruits.push('pink'); \nfruits.pop(); \nconsole.log(fruits[0]);",
          "let fruits = ['apple', 'banana']; \nfruits.push('pink'); \nfruits.pop(); \nconsole.log(fruits[0]);",

          // Option 4: Missing access of array element
          "let fruits = ['apple', 'banana']; \nfruits.push('pink'); \nfruits.pop();",

          // Option 5: Incorrect pop usage (removes specific element instead of last)
          "let fruits = ['apple', 'banana']; \nfruits.push('pink'); \nfruits.pop('banana'); \nconsole.log(fruits[0]);",
        ],
        answer:
          "let fruits = ['apple', 'banana']; \nfruits.push('pink'); \nfruits.pop(); \nconsole.log(fruits[0]);",
      },
    },
    //next lecture
    {
      group: "1",
      title: "Manipulating Arrays",
      description: "Apply array methods in code.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Create an array `fruits` with 'apple' and 'banana'. Add 'pink' to the end and remove 'apple' from the beginning.",
      },
    },
    {
      group: "1",
      title: "Use Cases for Arrays",
      description: "Explore scenarios where array types are used.",
      isText: true,
      question: {
        questionText:
          "Provide an example of how an array can be used to manage data in a web application.",
      },
    },
    {
      group: "1",
      title: "Terminal Practice: Creating Directories",
      description: "Creating directory command in a bash terminal",
      isCode: true,
      isTerminal: true,
      question: {
        questionText:
          "In a bash terminal environment, create a directory called app using the make directory command",
      },
    },
    //next lecture
    {
      group: "1",
      title: "Advanced Coding Output",
      description:
        "Predict the output of the following code with arrays, conditionals, logical operators, and array functions.",
      isSingleLineText: true,
      question: {
        questionText: (
          <div>
            What will be the output of the following code?
            <br />
            <pre>
              {`
let arr = [1, 2, 3, 4];
let x = 10;
let y = 5;

if (x > y && arr.length > 3) {
  arr.push(x);  
  arr = arr.filter(n => n % 2 === 0);
}

console.log(arr);

             `}{" "}
            </pre>
          </div>
        ),
        placeholder: "Type your answer here...",
        answer: "[2, 4, 10]",
      },
    },
    {
      group: "1",
      title: "Review With AI Conversation (optional)",
      isConversationReview: true,
      description: "Review the subjects you've answered",
      question: {
        questionText: "Let's chat about the questions we've worked on so far.",
        range: [10, 29], // Indices of steps to review
      },
    },
    {
      group: "2",
      title: "Introduction to Objects",
      description:
        "In this step, you will learn what an object is in programming.",
      isSingleLineText: true, // Single line text question type
      question: {
        questionText:
          "In programming, what keyword is used to create an object in JavaScript?",
        placeholder: "Type your answer here...", // Placeholder for the input
        answer: "new", // Expected one-word answer for object creation
      },
    },
    {
      group: "2",
      title: "Understanding the Constructor Method",
      description:
        "In this step, you will learn about the purpose of the `constructor` method in a class.",
      isCodeCompletion: true, // Correctly indicates it's a code completion problem
      question: {
        questionText: `Which of the following code blocks correctly defines the constructor method and uses the "new" keyword for class instantiation?`,

        options: [
          // Option 1: Correct constructor method with new keyword
          `class Car {
  constructor(brand) {
    this.brand = brand;
  }

  drive() {
    console.log('The car is driving');
  }
}

const myCar = new Car('Toyota');`,

          // Option 2: Incorrect - missing parameter
          `class Car {
  constructor() {
    this.brand = 'Toyota';
  }

  drive() {
    console.log('The car is driving');
  }
}

const myCar = new Car();`,

          // Option 3: Incorrect - wrong syntax
          `class Car {
  constructor = (brand) => {
    this.brand = brand;
  }

  drive() {
    console.log('The car is driving');
  }
}

const myCar = new Car('Toyota');`,

          // Option 4: Incorrect - uses method name instead of constructor
          `class Car {
  Car(brand) {
    this.brand = brand;
  }

  drive() {
    console.log('The car is driving');
  }
}

const myCar = new Car('Toyota');`,
        ],

        answer: `class Car {
  constructor(brand) {
    this.brand = brand;
  }

  drive() {
    console.log('The car is driving');
  }
}

const myCar = new Car('Toyota');`, // The correct answer
      },
    },
    //next lecture
    {
      group: "2",
      title: "Understanding the Constructor Method",
      description:
        "In this step, you will learn about the purpose of the `constructor` method in a class.",
      isText: true,
      question: {
        questionText:
          "Explain the purpose of the `constructor` method in a class.",
      },
    },
    {
      group: "2",
      title: "Creating an Instance of a Class",
      description:
        "In this step, you will learn how to create an instance of a class in JavaScript.",
      isMultipleAnswerChoice: true, // Indicates it's a multiple answer question
      question: {
        questionText:
          "Select all the correct steps required to create an instance of a class in JavaScript:",
        options: [
          // Correct options
          "Define a class using the `class` keyword",
          "Define the class with the `function` keyword",
          "Use the `new` keyword to create an instance",
          "Declare the class instance with `const classInstance = Car()`",
          "Pass arguments required by the constructor when calling the class",
          "Store the new instance in a variable",
          "Call the class directly without the `new` keyword",
          "Instantiate the class before defining it",

          // Incorrect options
        ],
        answer: [
          // The 4 correct options
          "Define a class using the `class` keyword",
          "Use the `new` keyword to create an instance",
          "Pass arguments required by the constructor when calling the class",
          "Store the new instance in a variable",
        ],
      },
    },
    {
      group: "2",
      title: "Declaring a Method in a Class",
      description:
        "In this step, you will learn how to declare a method inside a class.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Declare a method named `updateModel` in the `Car` class that updates the `model` property.",
      },
    },

    //next lecture
    {
      group: "2",
      title: "Using the `this` Keyword",
      description:
        "Complete the code by selecting the correct way to use the `this` keyword in a class method.",
      isCodeCompletion: true,
      question: {
        questionText:
          "Which code block correctly uses the `this` keyword to refer to the object's property?",
        options: [
          // Option 1: Correct use of the `this` keyword

          // Option 2: Incorrect use of the global object
          `class Car {
  constructor(brand) {
    this.brand = brand;
  }

  showBrand() {
    console.log(brand);
  }
}

const myCar = new Car('Toyota');
myCar.showBrand();`,
          `class Car {
  constructor(brand) {
    this.brand = brand;
  }

  showBrand() {
    console.log(this.brand);
  }
}

const myCar = new Car('Toyota');
myCar.showBrand();`,

          // Option 3: Incorrect reference to class name
          `class Car {
  constructor(brand) {
    brand = this.brand;
  }

  showBrand() {
    console.log(brand);
  }
}

const myCar = new Car('Toyota');
myCar.showBrand();`,

          // Option 4: Incorrect reference to method name
          `class Car {
  constructor(brand) {
    brand = this.brand;
  }

  showBrand() {
    console.log(this.brand);
  }
}

const myCar = new Car('Toyota');
myCar.showBrand();`,
        ],
        answer: `class Car {
  constructor(brand) {
    this.brand = brand;
  }

  showBrand() {
    console.log(this.brand);
  }
}

const myCar = new Car('Toyota');
myCar.showBrand();`,
      },
    },
    {
      group: "2",
      title: "Adding Properties to an Object",
      description:
        "In this step, you will learn how to add properties to an object in JavaScript.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText: "Add a new property `year` to the `Car` class.",
      },
    },
    {
      group: "2",
      title: "Accessing and Modifying Object Properties",
      description:
        "In this step, you will learn how to get or set properties of an object in JavaScript, either by directly accessing properties or by using getter and setter functions.",
      isMultipleAnswerChoice: true,
      question: {
        questionText:
          "Which of the following are valid ways to get or set properties in a JavaScript object?",
        options: [
          "Use a function call to delete a property (e.g., obj.deleteProperty())",
          "Use bracket notation to access a property (e.g., obj['property'])",
          "Use a setter function to update a property value",
          "Use dot notation to access a property (e.g., obj.property)",
          "Use a getter function to return a property value",
          "Directly call obj.property() to access a property",
        ],
        answer: [
          "Use dot notation to access a property (e.g., obj.property)",
          "Use bracket notation to access a property (e.g., obj['property'])",
          "Use a getter function to return a property value",
          "Use a setter function to update a property value",
        ],
      },
    },

    //next lecture
    {
      group: "2",
      title: "Modifying Object Properties",
      description:
        "In this step, you will learn how to modify properties of an object in JavaScript.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Modify the `model` property of an instance of the `Car` class.",
      },
    },
    {
      group: "2",
      title: "Understanding Inheritance",
      description:
        "In this step, you will learn about inheritance in object-oriented programming.",
      isText: true,
      question: {
        questionText: "What is inheritance in object-oriented programming?",
      },
    },
    {
      group: "2",
      title: "Implementing Inheritance",
      description:
        "In this step, you will implement inheritance in JavaScript by extending a class.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Extend the `Car` class to create an `ElectricCar` class with an additional property `batteryLife`.",
      },
    },

    //next lecture
    {
      group: "2",
      title: "Overriding Methods",
      description:
        "In this step, you will learn how to override methods in a subclass.",
      isMultipleChoice: true,
      question: {
        questionText: "What does it mean to override a method in a subclass?",
        options: [
          "To delete the method from the class",
          "To replace a method inherited from the superclass",
          "To inherit a method without changes",
          "To call a method from a different class",
          "To extend a method's functionality in the subclass",
        ],
        answer: "To replace a method inherited from the superclass",
      },
    },

    {
      group: "2",
      title: "Understanding Encapsulation",
      description:
        "In this step, you will learn about encapsulation in object-oriented programming.",
      isText: true,
      question: {
        questionText: "What is encapsulation in object-oriented programming?",
      },
    },
    {
      group: "2",
      title: "Implementing Encapsulation",
      description:
        "In this step, you will implement encapsulation by using getter and setter methods.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Add getter and setter methods for the `batteryLife` property in the `ElectricCar` class.",
      },
    },

    //next lecture
    {
      group: "2",
      title: "Understanding Encapsulation",
      description:
        "In this step, you will define the concept of encapsulation in object-oriented programming with a single word.",
      isSingleLineText: true,
      question: {
        questionText:
          "What is the primary concept encapsulation ensures in object-oriented programming?",
        placeholder: "Type your answer here...",
        answer: "Privacy",
      },
    },
    {
      group: "2",
      title: "Combining Concepts",
      description:
        "In this step, you will combine various concepts learned to create a small project.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Create a small project that defines a `Person` class, uses inheritance to create a `Student` class, and demonstrates encapsulation and arrays of objects.",
      },
    },
    {
      group: "2",
      title: "Printing In The Terminal",
      description: "In this step, you will print a message using the terminal",
      isCode: true,
      isTerminal: true,
      question: {
        questionText:
          "Type a command to print the message: 'I'm talking to the inside of a computer!'",
      },
    },
    //next lecture
    {
      group: "2",
      title: "Review With AI Conversation (optional)",
      isConversationReview: true,
      description: "Review the subjects you've answered",
      question: {
        questionText: "Let's chat about the questions we've worked on so far.",
        range: [31, 47], // Indices of steps to review
      },
    },
    {
      group: "3",
      title: "Introduction to React Components",
      description:
        "In this step, you will learn about React components, their role in creating reusable UI elements, and how they help manage the user interface efficiently.",
      isMultipleChoice: true,
      question: {
        questionText:
          "Which of the following best describes a React component?",
        options: [
          "A method for handling events in JavaScript",
          "A feature exclusive to server-side rendering in React",
          "A reusable piece of user interface defined as a function or class that returns JSX",
          "A built-in HTML element in React",
        ],
        answer:
          "A reusable piece of user interface defined as a function or class that returns JSX",
      },
    },
    {
      group: "3",
      title: "Key Concepts in React",
      description:
        "In this step, you will learn about the fundamental concepts of React, including properties (props), state, events, and styles.",
      isMultipleAnswerChoice: true,
      question: {
        questionText: "Which of the following are key concepts in React?",
        options: [
          "Managing properties to pass data between components",
          "Manipulating the DOM directly for better performance",
          "Using state to manage data within a component",
          "Handling events such as clicks with event handlers",
          "Applying inline styles or CSS classes to components",
        ],
        answer: [
          "Managing properties to pass data between components",
          "Using state to manage data within a component",
          "Handling events such as clicks with event handlers",
          "Applying inline styles or CSS classes to components",
        ],
      },
    },
    {
      group: "3",
      title: "Effect of State Changes on a Component",
      description:
        "In this step, you will explain what happens to a React component when its state changes.",
      isText: true,
      question: {
        questionText:
          "What happens to a React component when its state changes?",
      },
    },

    //next lecture
    {
      group: "3",
      title: "Creating a Simple React Component",
      description:
        "In this step, you will define a basic React component that returns some simple JSX.",
      isCodeCompletion: true,
      question: {
        questionText:
          "Which of the following code blocks correctly defines a simple React component that returns a heading and a paragraph?",
        options: [
          // Option 1: Correct answer
          `function MyComponent() {
  return (
    <div>
      <h1>Hello, World!</h1>
      <p>Welcome to the thunderdome</p>
    </div>
  );
}`,

          // Option 2: Incorrect - missing return statement
          `function MyComponent() {
  <div>
    <h1>Hello, World!</h1>
    <p>Welcome to the thunderdome</p>
  </div>;
}`,

          // Option 3: Incorrect - uses class instead of function
          `class MyComponent {
  render() {
    return (
      <div>
        <h1>Hello, World!</h1>
        <p>How are we today?</p>
      </div>
    );
  }
}`,

          // Option 4: Incorrect - missing JSX inside the return
          `function MyComponent() {
  return (
    <div>Hello World</div>
    <p>How are we today?</p>
  );
}`,
        ],
        answer: `function MyComponent() {
  return (
    <div>
      <h1>Hello, World!</h1>
      <p>Welcome to the thunderdome</p>
    </div>
  );
}`,
      },
    },
    {
      group: "3",
      title: "Handling Events in React",
      description:
        "In this step, you will define a basic React component that handles a button click event using the `onClick` attribute.",
      isCodeCompletion: true,
      question: {
        questionText:
          "Which of the following code blocks correctly defines a React component that handles a button click event?",
        options: [
          // Option 2: Incorrect - no event handler function defined
          `function MyComponent() {
  return (
    <div>
      <button 
        onClick={
          alert('Button clicked!')
        }
      >
        Click me
      </button>
    </div>
  );
}`,

          // Option 3: Incorrect - inline event handler, not recommended
          `function MyComponent() {
return (
  <div>
    <button 
      onClick= () => {
        alert('Button clicked!')
      }
    >
      Click me
    </button>
  </div>
);
}`,
          `function MyComponent() {
  const handleClick = () => {
    alert('Button clicked!');
  };
    
  return (
    <div>
      <button 
        onClick={handleClick}
      >
        Click me
      </button>
    </div>
  );
}`,

          // Option 4: Incorrect - no onClick attribute
          `function MyComponent() {
return (
  <div>
    <button>
      Click me
    </button>
  </div>
);
    }`,
        ],
        answer: `function MyComponent() {
  const handleClick = () => {
    alert('Button clicked!');
  };

  return (
    <div>
      <button 
        onClick={handleClick}
      >
        Click me
      </button>
    </div>
  );
}`,
      },
    },

    {
      group: "3",
      title: "Managing State with useState Hook",
      description:
        "In this step, you will learn how to use the useState hook to manage the state of a component.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText: `Modify the Tweet component to include a like button that toggles the liked state using the useState hook.`,
      },
    },

    //next lecture
    {
      group: "3",
      title: "Component Properties",
      description:
        "In this step, you will learn about passing properties to components in React.",
      isSingleLineText: true,
      question: {
        questionText:
          "What is the term used for passing data to a React component?",
        placeholder: "Type your answer here...",
        answer: "props",
      },
    },
    {
      group: "3",
      title: "Passing and Using Props",
      description:
        "In this step, you will learn how to pass and use props in a React component.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Update the Tweet component to accept and display the user's name, handle, and tweet content as props.",
      },
    },
    {
      group: "3",
      title: "Working with Props and State Together",
      description:
        "In this step, you will learn how to work with both props and state in a React component.",
      isMultipleChoice: true,
      question: {
        questionText:
          "What is the main difference between props and state in React?",
        options: [
          "Props are immutable while state is mutable",
          "Props are managed by the component itself while state is passed down from parent components",
          "State is used for styling while props are used for logic",
          "There is no difference; they are the same",
        ],
        answer: "Props are immutable while state is mutable",
      },
    },

    //next lecture
    {
      group: "3",
      title: "Terminal Practice: Listing Files",
      description:
        "In this step, you will learn how to list files in a bash terminal.",
      isCode: true,
      isTerminal: true,
      question: {
        questionText: `Use the terminal to list all the files using the list command.`,
      },
    },

    {
      group: "3",
      title: "Styling React Components",
      description:
        "In this step, you will learn how to style React components using CSS.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText: `Add styles to the Tweet component to improve its appearance.`,
      },
    },
    {
      group: "3",
      title: "Using Flexbox for Layouts",
      description:
        "In this step, you will learn how to use Flexbox to create layouts in React.",
      isSelectOrder: true,
      question: {
        questionText:
          "Arrange the following CSS properties in the order needed to center a basic layout with flexbox styling:",
        options: [
          "display: flex;",
          "justify-content: center;",
          "align-items: center;",
          "flex-direction: row;",
        ],
        answer: [
          "display: flex;",
          "flex-direction: row;",
          "justify-content: center;",
          "align-items: center;",
        ],
      },
    },

    //next lecture
    {
      group: "3",
      title: "Lifting State Up",
      description:
        "In this step, you will learn how to lift state up to a common ancestor component to share state between components.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText: `Create a parent component that manages the state for multiple Tweet components and passes the state and event handlers as props.`,
      },
    },
    {
      group: "3",
      title: "Using useEffect for Side Effects",
      description:
        "In this step, you will learn how to use the useEffect hook to handle side effects in a React component.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Modify the Tweet component to use the useEffect hook to log a message to the console every time the number of retweets changes.",
      },
    },

    {
      group: "3",
      title: "Understanding Component Lifecycle",
      description:
        "In this step, you will learn about the lifecycle of React components and how to use useEffect hook to manage side effects.",
      isText: true,
      question: {
        questionText:
          "What is the component lifecycle in React and what is the purpose of the useEffect hook?",
      },
    },

    //next
    {
      group: "3",
      title: "Fetching Data with useEffect",
      description:
        "In this step, you will learn how to fetch data from an API using the useEffect hook.",
      isSelectOrder: true,
      question: {
        questionText:
          "Arrange the steps with drag-and-drop to correctly fetch data using useEffect.",
        options: [
          "Import React and useState",
          "Import useEffect from React",
          "Create a component",
          "Define the useEffect hook",
          "Make the API call inside useEffect",
          "Use async/await or .then() to handle the API response",
          "Update the component state with the fetched data",
          "Handle errors in the API call",
          "Render the data in the component",
        ],
        answer: [
          "Import React and useState",
          "Import useEffect from React",
          "Create a component",
          "Define the useEffect hook",
          "Make the API call inside useEffect",
          "Use async/await or .then() to handle the API response",
          "Update the component state with the fetched data",
          "Handle errors in the API call",
          "Render the data in the component",
        ],
      },
    },

    {
      group: "3",
      title: "Building a Complete Tweet App",
      description:
        "In this step, you will combine everything you have learned to build a complete Tweet app.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText: `Build a complete Tweet app that fetches tweets from an API, displays them using the Tweet component, and allows users to like and retweet.`,
      },
    },
    {
      group: "3",
      title: "Terminal Practice: Setting Up A React App",
      description: "In this step, you will learn how to set up a react project",

      isText: true,
      question: {
        questionText:
          "Enter the command to install the latest version of a react project with vite.",
      },
    },

    //next
    {
      group: "3",
      title: "Creating a New React Project with Vite",
      description:
        "In this step, you will learn how to create a new React project using Vite by following the correct steps and running command-line commands.",
      isSelectOrder: true,
      question: {
        questionText:
          "Arrange the steps with drag-and-drop to correctly create a new React project using Vite, including command-line commands.",
        options: [
          "Ensure Node.js, NPM and VSCode are installed",
          "Run `npm create vite@latest` to create a new Vite project",
          "Select the React template when prompted",
          "Navigate to the project directory using `cd project-name`",
          "Run `npm install` to install dependencies",
          "Start the development server with `npm run dev`",
        ],
        answer: [
          "Ensure Node.js, NPM and VSCode are installed",
          "Run `npm create vite@latest` to create a new Vite project",
          "Select the React template when prompted",
          "Navigate to the project directory using `cd project-name`",
          "Run `npm install` to install dependencies",
          "Start the development server with `npm run dev`",
        ],
      },
    },
    {
      group: "3",
      title: "Review With AI Conversation (optional)",
      isConversationReview: true,
      description: "Review the subjects you've answered",
      question: {
        questionText: "Let's chat about the questions we've worked on so far.",
        range: [49, 67], // Indices of steps to review
      },
    },
    {
      group: "4",
      title: "Introduction to Backend Engineering",
      description:
        "In this step, you will learn about what backend software engineering is and why it is important.",
      isText: true,
      question: {
        questionText:
          "What is backend software engineering and why is it important in building applications?",
      },
    },

    {
      group: "4",
      title: "Main Lessons Overview",
      description:
        "In this step, you will identify a core responsibility of backend engineering covered in the course.",
      isMultipleChoice: true,
      question: {
        questionText:
          "Which of the following is a core responsibility in backend engineering?",
        options: [
          "Managing concurrency and ensuring thread safety in multi-user applications",
          "Implementing user authentication directly in the user experience",
          "Handling memory allocation and garbage collection in server environments",
          "Designing scalable UI components for cross-browser compatibility",
          "Optimizing database queries and ensuring data consistency",
        ],
        answer: "Optimizing database queries and ensuring data consistency",
      },
    },

    // next
    {
      group: "4",
      title: "Key Responsibilities of Backend Engineering",
      description:
        "In this step, you will learn about the various responsibilities involved in backend engineering.",
      isMultipleAnswerChoice: true,
      question: {
        questionText:
          "Which of the following are core responsibilities of backend engineering?",
        options: [
          "Managing and optimizing databases for storing and retrieving data efficiently",
          "Designing and implementing APIs to facilitate communication between systems",
          "Ensuring security through user authentication and authorization mechanisms",
          "Handling server-side logic, including business operations and calculations",
          "Maintaining server reliability and performance under high traffic",
          "Managing data integrity and consistency across distributed systems",
          "Implementing logging and monitoring to ensure system health and debug issues",
        ],
        answer: [
          "Managing and optimizing databases for storing and retrieving data efficiently",
          "Designing and implementing APIs to facilitate communication between systems",
          "Ensuring security through user authentication and authorization mechanisms",
          "Handling server-side logic, including business operations and calculations",
          "Maintaining server reliability and performance under high traffic",
          "Managing data integrity and consistency across distributed systems",
          "Implementing logging and monitoring to ensure system health and debug issues",
        ],
      },
    },
    {
      group: "4",
      title: "Interfacing with the Terminal",
      description:
        "In this step, you will learn about the importance of the terminal in backend engineering and how to interact with it for various tasks.",
      isText: true,
      question: {
        questionText:
          "Why is learning to use the terminal important for operating systems, and what kinds of tasks can you perform using the terminal?",
      },
    },
    {
      group: "4",
      title: "Installing NPM",
      description: "In this step, you will learn how to install npm globally",

      isText: true,
      question: {
        questionText:
          "Write the command to install the node package manager (npm) globally onto your computer",
      },
    },

    //  next
    {
      group: "4",
      title: "Installing An NPM Package",
      description:
        "In this step, you will use the terminal to install a package with npm.",
      isText: true,
      question: {
        questionText: `Write a command to install Chakra's react component library for user interface elements.`,
      },
    },
    {
      group: "4",
      title: "User Creation and Authentication",
      description:
        "In this step, you will understand the key concept related to creating users in backend systems.",
      isSingleLineText: true,
      question: {
        questionText:
          "What is the process called that verifies a user's identity during account creation?",
        placeholder: "Type your answer here...",
        answer: "authentication",
      },
    },
    {
      group: "4",
      title: "Database Foundations",
      description:
        "In this step, you will learn about the foundations of databases in backend engineering.",
      isText: true,
      question: {
        questionText:
          "What are the main types of databases used in backend engineering?",
      },
    },

    //  next
    {
      group: "4",
      title: "Connecting Systems",
      description:
        "Write a code snippet to connect an application to a Firebase database.",
      isCode: true,
      question: {
        questionText: `Write a code snippet to connect an application to a Firebase database.`,
      },
    },
    {
      group: "4",
      title: "Initiating A Firebase Project",
      description:
        "In this step, you will understand how to start a Firebase project using the command line.",
      isSingleLineText: true,
      question: {
        questionText: "What is the command to start a Firebase project?",
        answer: "firebase init",
      },
    },
    {
      group: "4",
      title: "Advanced Data Storage Practices",
      description:
        "In this step, you will learn advanced practices for storing data responsibly in backend systems.",
      isMultipleAnswerChoice: true,
      question: {
        questionText:
          "Which of the following are best practices for ensuring responsible data storage in a backend system?",
        options: [
          "Cache data in memory to reduce database access time",
          "Use a large, centralized backup to reduce complexity and cost",
          "Encrypt sensitive data both at rest and in transit to ensure security",
          "Implement database replication across multiple data centers to improve fault tolerance",
        ],
        answer: [
          "Cache data in memory to reduce database access time",
          "Encrypt sensitive data both at rest and in transit to ensure security",
          "Implement database replication across multiple data centers to improve fault tolerance",
        ],
      },
    },

    //next
    {
      group: "4",
      title: "Initializing Firebase and Working with Firestore v9",
      description:
        "In this step, you will learn how to initialize Firebase and set up Firestore collections and documents in Firestore v9.",
      isCodeCompletion: true,
      question: {
        questionText:
          "Complete the code to initialize Firebase with the provided configuration and add a unique document to a Firestore collection.",
        options: [
          // Option 1: Correct code for initializing Firebase and adding a document

          // Option 2: Incorrect - missing Firestore initialization
          `import { 
  initializeApp 
} from 'firebase/app';

import { 
  collection, 
  setDoc 
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "progr-ai.firebaseapp.com",
  projectId: "progr-ai",
  storageBucket: "progr-ai.appspot.com",
  messagingSenderId: "32042075426",
  appId: "1:320420758826:web:68dfeffe8aa7b6421e8a53",
  measurementId: "G-0E37NCB4KB",
};

initializeApp(firebaseConfig);
await setDoc(collection(db, 'users'), {
  name: 'John Doe',
  email: 'john@example.com'
});`,

          // Option 3: Incorrect - missing document ID in Firestore
          `import { 
  initializeApp 
} from 'firebase/app';

import { 
  getFirestore, 
  doc, 
  setDoc 
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "progr-ai.firebaseapp.com",
  projectId: "progr-ai",
  storageBucket: "progr-ai.appspot.com",
  messagingSenderId: "32042075426",
  appId: "1:320420758826:web:68dfeffe8aa7b6421e8a53",
  measurementId: "G-0E37NCB4KB",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Add document
await setDoc(doc(db, 'users'), {
  name: 'John Doe',
  email: 'john@example.com'
});`,
          `import { 
  initializeApp 
} from 'firebase/app';

import { 
  getFirestore,
  collection, 
  doc, 
  addDoc
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "progr-ai.firebaseapp.com",
  projectId: "progr-ai",
  storageBucket: "progr-ai.appspot.com",
  messagingSenderId: "32042075426",
  appId: "1:320420758826:web:68dfeffe8aa7b6421e8a53",
  measurementId: "G-0E37NCB4KB",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Add document
await addDoc(collection(db, 'users'), {
  name: 'John Doe',
  email: 'john@example.com'
});`,

          // Option 4: Incorrect - missing import for Firestore methods
          `import { 
  initializeApp 
} from 'firebase/app';
    
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "progr-ai.firebaseapp.com",
  projectId: "progr-ai",
  storageBucket: "progr-ai.appspot.com",
  messagingSenderId: "32042075426",
  appId: "1:320420758826:web:68dfeffe8aa7b6421e8a53",
  measurementId: "G-0E37NCB4KB",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Add document
await addDoc(doc(db, 'users', 'user123'), {
  name: 'John Doe',
  email: 'john@example.com'
});`,
        ],
        answer: `import { 
  initializeApp 
} from 'firebase/app';

import { 
  getFirestore,
  collection, 
  doc, 
  addDoc
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "progr-ai.firebaseapp.com",
  projectId: "progr-ai",
  storageBucket: "progr-ai.appspot.com",
  messagingSenderId: "32042075426",
  appId: "1:320420758826:web:68dfeffe8aa7b6421e8a53",
  measurementId: "G-0E37NCB4KB",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Add document
await addDoc(collection(db, 'users'), {
  name: 'John Doe',
  email: 'john@example.com'
});`,
      },
    },
    {
      group: "4",
      title: "Handling User Data",
      description:
        "In this step, you will learn how to handle user data in backend systems.",
      isCode: true,
      question: {
        questionText: `Write a code snippet to get a user object with properties for username and email using firebase auth.`,
      },
    },
    {
      group: "4",
      title: "Retrieving a User Document After Authentication",
      description:
        "In this step, you will learn how to retrieve a user document from Firestore using authentication data.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Write code to retrieve a user document from the `users` collection in Firestore using the authenticated user's ID.",
      },
    },

    //next
    {
      group: "4",
      title: "Understanding the Authentication Flow",
      description:
        "In this step, you will learn about the typical flow of authentication in backend systems.",
      isSelectOrder: true,
      question: {
        questionText:
          "Arrange the following steps in the correct order for a typical authentication flow in a backend system.",
        options: [
          "User enters credentials (email and password) on the login form",
          "The backend verifies the credentials with the authentication service",
          "Identity tokens or sessions are created for the authenticated user",
          "The system retrieves user data from your database based on your tokens",
          "The user is granted access to the protected resources",
        ],
        answer: [
          "User enters credentials (email and password) on the login form",
          "The backend verifies the credentials with the authentication service",
          "Identity tokens or sessions are created for the authenticated user",
          "The system retrieves user data from your database based on your tokens",
          "The user is granted access to the protected resources",
        ],
      },
    },
    {
      group: "4",
      title: "OAuth Authentication",
      description:
        "In this step, you will learn about OAuth-style authentication systems.",
      isSingleLineText: true,
      question: {
        questionText:
          "What is the widely used protocol for authorization that allows third-party services to access user data without exposing credentials?",
        placeholder: "Type your answer here...",
        answer: "OAuth",
      },
    },
    {
      group: "4",
      title: "Using Environment Variables",
      description:
        "In this step, you will learn about using environment variables in backend development.",
      isText: true,
      question: {
        questionText: "What role do environment variables have in a codebase?",
      },
    },

    //next
    {
      group: "4",
      title: "Database Relationships",
      description:
        "In this step, you will learn about relationships in databases.",
      isCode: true,
      question: {
        questionText:
          "Write a code snippet to define a one-to-many relationship between users and posts in a database.",
      },
    },
    {
      group: "4",
      title: "Interfacing with an API",
      description:
        "In this step, you will learn the common HTTP methods used to interface with an API and some less common methods.",
      isMultipleAnswerChoice: true,
      question: {
        questionText:
          "Which of the following HTTP methods are commonly used to interface with an API, and what do they do?",
        options: [
          "GET (Retrieves data from the server)",
          "POST (Creates a new resource on the server)",
          "SEND (Sends data to the server for processing)",
          "FETCH (Used to fetch data from a resource)",
          "PATCH (Partially updates a resource on the server)",
          "REMOVE (Removes data from a server)",
          "PUT (Updates an existing resource on the server)",
          "DELETE (Deletes a resource from the server)",
        ],
        answer: [
          "GET (Retrieves data from the server)",
          "POST (Creates a new resource on the server)",
          "PUT (Updates an existing resource on the server)",
          "DELETE (Deletes a resource from the server)",
          "PATCH (Partially updates a resource on the server)",
        ],
      },
    },
    {
      group: "4",
      title: "Creating A User Authentication System",
      description:
        "In this step, you will create a simple user authentication system.",
      isSelectOrder: true,
      question: {
        questionText:
          "Arrange the steps with drag-and-drop to implement user authentication using JSON Web Tokens.",
        options: [
          "Install JWT library",
          "Set up a user model in the database",
          "Create a register route for new users",
          "Hash user password before storing",
          "Create a login route",
          "Verify user credentials",
          "Generate a JWT token",
          "Send JWT token back to the client",
          "Create a protected route that requires authentication",
          "Verify JWT token on protected routes",
        ],
        answer: [
          "Install JWT library",
          "Set up a user model in the database",
          "Create a register route for new users",
          "Hash user password before storing",
          "Create a login route",
          "Verify user credentials",
          "Generate a JWT token",
          "Send JWT token back to the client",
          "Create a protected route that requires authentication",
          "Verify JWT token on protected routes",
        ],
      },
    },
    {
      group: "4",
      title: "Deploying a Firebase Application",
      description:
        "In this step, you will learn how to deploy a backend firebase application to a cloud service.",

      isText: true,
      question: {
        questionText:
          "Write a command to deploy a Firebase application in the command line.",
      },
    },
    {
      group: "4",
      title: "Review With AI Conversation (optional)",
      isConversationReview: true,
      description: "Review the subjects you've answered",
      question: {
        questionText: "Let's chat about the questions we've worked on so far.",
        range: [69, 89], // Indices of steps to review
      },
    },
    {
      group: "5",
      title: "Benefits of Serverless Cloud Platforms",
      description:
        "In this step, you will explore the advantages of using serverless cloud platforms like Firebase or Vercel in software development.",
      isText: true,
      question: {
        questionText:
          "What are the key benefits of using serverless cloud platforms like Firebase or Vercel in software development, and how do they differ from traditional server-based models?",
      },
    },
    {
      group: "5",
      title: "Understanding VSCode",
      description:
        "In this step, you will explore what Visual Studio Code (VSCode) is and why it is a popular code editor.",
      isText: true,
      question: {
        questionText:
          "What is Visual Studio Code (VSCode) and why is it one of the most popular code editors among developers?",
      },
    },
    {
      group: "5",
      title: "Installing Node.js and NPM",
      description:
        "Install Node.js, which lets you build JavaScript applications.",
      isText: true,
      question: {
        questionText:
          "What is the purpose of Node.js and npm in JavaScript development in simple terms?",
      },
    },
    {
      group: "5",
      title: "Installing 'package.json' Packages.",
      description: "Installing the files found in package.json.",
      isSingleLineText: true,
      question: {
        questionText:
          "Enter the command to install the packages found in a react project using npm.",
        answer: "npm install",
      },
    },
    {
      group: "5",
      title: "Install Firebase Tools Globally",
      description: "Install Firebase tools globally using the command line.",

      isSingleLineText: true,
      question: {
        questionText:
          "Use the terminal to install firebase-tools globally. What command do you use?",
        answer: "npm install -g firebase-tools.",
      },
    },
    {
      group: "5",
      title: "Setting Up a React and Firebase Project with VSCode",
      description:
        "In this step, you will arrange the steps required to set up a React project using Vite, connect Firebase services, and install the necessary tools using Visual Studio Code (VSCode).",
      isSelectOrder: true,
      question: {
        questionText:
          "Arrange the following steps in the correct order to set up a React project using Vite, install Node.js and npm, and connect Firebase services using VSCode.",
        options: [
          "Install Node.js and npm on your machine",
          "Install Visual Studio Code (VSCode)",
          "Open VSCode and navigate to the terminal",
          "Run `npm create vite@latest` to create a new React project",
          "Navigate to the project folder using `cd project-name`",
          "Run `npm install` to install dependencies",
          "Install Firebase CLI using `npm install -g firebase-tools`",
          "Log into Firebase using `firebase login`",
          "Initialize Firebase in the project using `firebase init`",
          "Enable Firebase services such as Firestore or Authentication",
          "Connect Firebase to your React project by adding Firebase config",
          "Start the development server using `npm run dev`",
        ],
        answer: [
          "Install Node.js and npm on your machine",
          "Install Visual Studio Code (VSCode)",
          "Open VSCode and navigate to the terminal",
          "Run `npm create vite@latest` to create a new React project",
          "Navigate to the project folder using `cd project-name`",
          "Run `npm install` to install dependencies",
          "Install Firebase CLI using `npm install -g firebase-tools`",
          "Log into Firebase using `firebase login`",
          "Initialize Firebase in the project using `firebase init`",
          "Enable Firebase services such as Firestore or Authentication",
          "Connect Firebase to your React project by adding Firebase config",
          "Start the development server using `npm run dev`",
        ],
      },
    },

    {
      group: "5",
      title: "Setting Up Firebase",
      description:
        "In this step, you will set up Firebase for your project, including Authentication, Firestore, and Analytics.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Write the JavaScript code to initialize Firebase in your project, and connect Authentication, Firestore, and Analytics services.",
      },
    },
    {
      group: "5",
      title: "Introduction to GitHub",
      description:
        "Learn about using GitHub to collaborate with other developers.",
      isMultipleChoice: true,
      question: {
        questionText: "What is GitHub primarily used for?",
        options: [
          "Hosting websites",
          "Managing code repositories",
          "Decentralizing software",
          "Collecting data",
        ],
        answer: "Managing code repositories",
      },
    },
    {
      group: "5",
      title: "Cloning Github Projects",
      description: "Cloning Github projects in the command line.",
      isCode: true,
      isTerminal: true,
      question: {
        questionText:
          "Use the terminal to clone the embedded-sunset Github project by Robots Building Education using git commands.",
        answer:
          "git clone https://github.com/RobotsBuildingEducation/embedded-sunset.git",
      },
    },
    {
      group: "5",
      title: "Popular Alternatives to Firebase",
      description:
        "In this step, you will explore some popular alternatives to Firebase for various backend services such as database management, authentication, and hosting.",
      isMultipleAnswerChoice: true,
      question: {
        questionText:
          "Which of the following are popular alternatives to Firebase for building full-stack applications?",
        options: [
          "Supabase", // Correct
          "AWS Amplify", // Correct
          "MongoDB Realm", // Correct
          "HerokuDB", // Incorrect
          "AngularJS", // Incorrect
          "Vercel", // Incorrect
          "Cloudflare", // Incorrect
        ],
        answer: ["Supabase", "AWS Amplify", "MongoDB Realm", "Cloudflare"], // Incorrect],
      },
    },
    {
      group: "5",
      title: "Most Common Firebase Products",
      description:
        "In this step, you will identify the core Firebase products commonly used in web and mobile app development.",
      isMultipleAnswerChoice: true,
      question: {
        questionText:
          "Which of the following are commonly used Firebase products?",
        options: [
          "Firestore: Cloud NoSQL database for storing and syncing data", // Correct
          "Firebase Ads: Platform for integrating advertising", // Incorrect
          "Authentication: User sign-in and identity management", // Correct
          "Firebase Functions: Serverless backend for running code", // Correct
          "Firebase Storage: File storage for user-generated content", // Correct
          "Firebase Machine Learning: ML tools for app features", // Correct
          "Firebase Builder: Tool for creating Firebase services", // Incorrect
          "Firebase Hosting: Web hosting for deploying static content", // Correct
          "Firebase Cache: Caching service for high-performance storage", // Incorrect
          "Firebase Realtime Database: Real-time syncing database", // Correct
          "Firebase Firestore: A document-collection database", // Co
          "Firebase Analytics: Tracks user engagement and events in your app", // Correct
        ],
        answer: [
          "Firestore: Cloud NoSQL database for storing and syncing data",
          "Authentication: User sign-in and identity management",
          "Firebase Realtime Database: Real-time syncing database",
          "Firebase Hosting: Web hosting for deploying static content",
          "Firebase Functions: Serverless backend for running code",
          "Firebase Storage: File storage for user-generated content",
          "Firebase Analytics: Tracks user engagement and events in your app",
          "Firebase Firestore: A document-collection database", // Co
          "Firebase Machine Learning: ML tools for app features",
        ],
      },
    },

    {
      group: "5",
      title: "Pulling Updates With Github",
      description: "Update your version of code by pulling with Github.",

      isSingleLineText: true,
      question: {
        questionText:
          "Use the terminal to update your local Github project with the latest version available on Github",
      },
    },
    {
      group: "5",
      title: "Authenticating Users",
      description:
        "Install Firebase and react-firebaseui to create users in your application.",
      isMultipleChoice: true,
      question: {
        questionText:
          "Which package do you use to handle the user experience for authentication with Firebase?",
        options: [
          "firebase",
          "firebase-auth",
          "firebase-hooks",
          "react-firebaseui",
          "firebase-admin",
          "firebase-functions",
          "firebase-storage",
          "firebase-database",
        ],
        answer: "react-firebaseui",
      },
    },
    {
      group: "5",
      title: "Enabling Google Sign-In",
      description:
        "Enable Google Sign-In method in your Firebase authentication settings.",
      isText: true,
      question: {
        questionText:
          "What steps do you follow to enable Google Sign-In in Firebase authentication settings?",
      },
    },
    {
      group: "5",
      title: "Connecting Firebase to Your Code",
      description:
        "Retrieve Firebase configuration keys and connect them to your code.",
      isCode: true,
      question: {
        questionText:
          "Write the code to initialize Firebase in your project using the configuration keys.",
      },
    },
    {
      group: "5",
      title:
        "Rendering Sign-In Button in React with Firebase and react-firebaseui",
      description:
        "In this step, you will render a sign-in button in your React application using Firebase Authentication and the react-firebaseui library.",
      isCode: true,
      question: {
        questionText:
          "Write the code to render a Firebase sign-in button in a React component using Firebase Authentication and react-firebaseui.",
      },
    },
    {
      group: "5",
      title: "Displaying User Data",
      description: "Use useEffect to display user data when they log in.",
      isCode: true,
      question: {
        questionText:
          "Write the code to display user data using the useEffect hook when they log in with firebase.",
      },
    },
    {
      group: "5",
      title: "Updating User Profile",
      description:
        "Update the user profile information in your Firebase database after they have logged in.",
      isCode: true,
      question: {
        questionText:
          "Write the code to update user profile information in Firebase Firestore.",
      },
    },
    {
      group: "5",
      title: "Updating A Github Project",
      description: "Chaining git commands to update a Github project.",
      isSingleLineText: true,
      question: {
        questionText:
          "Enter the combination of github commands to write and update a codebase with a message.",
        answer: `git add . && git commit -m "your_message" && git push origin main`,
      },
    },
    {
      group: "5",
      title: "Using GitHub Commands",
      description: "Learn the basic GitHub commands for managing your code.",
      isSelectOrder: true,
      question: {
        questionText:
          "Arrange the following Git commands in the correct order to programmatically create a new repository and push to your GitHub account:",
        options: [
          "git init",
          "git add .",
          "git commit -m 'Initial commit'",
          "git remote add origin <repository-url>",
          "git branch -M main",
          "git push -u origin main",
        ],
        answer: [
          "git init",
          "git add .",
          "git commit -m 'Initial commit'",
          "git remote add origin <repository-url>",
          "git branch -M main",
          "git push -u origin main",
        ],
      },
    },
    {
      group: "5",
      title: "Review With AI Conversation (optional)",
      isConversationReview: true,
      description: "Review the subjects you've answered",
      question: {
        questionText: "Let's chat about the questions we've worked on so far.",
        range: [91, 110], // Indices of steps to review
      },
    },
  ],
  es: [
    {
      group: "introducción",
      title: "Introducción al Desarrollo de Software",
      isStudyGuide: true,
      description:
        "Expóngase a los fundamentos para mejorar la calidad de su aprendizaje antes de avanzar.",
      question: {
        questionText: (
          <div>
            <p style={{ marginBottom: 12 }}>
              {" "}
              Uno de los mejores indicadores de éxito académico para un
              estudiante es su exposición al material del curso antes de
              estudiarlo. Se te anima a leer sobre los fundamentos del software
              antes de comenzar.
            </p>

            <p style={{ marginBottom: 12 }}>
              ¡Recuerda fracasar rápido y aprender de cada error! La verdadera
              educación ocurre cuando superas un desafío. Empezaremos de forma
              suave y sencilla al principio, pero luego iremos aumentando la
              dificultad a medida que avances. ¡Asegúrate de utilizar las
              herramientas a tu disposición! Las vas a necesitar.
            </p>
          </div>
        ),
        metaData: `### Consejos
Sé que esto parece contenido de ChatGPT... 

pero no lo es -_-"!

Es importante recordar esto como principiante:

1. Construir cosas con software se trata principalmente de organizar información en lugar de ser bueno en matemáticas. Los lenguajes de programación usan lógica y computación para expresar ideas en lugar de ecuaciones y álgebra.

2. Al igual que el idioma inglés, puedes expresar las cosas de muchas maneras diferentes.

3. Cuando algo te desafíe, falla más rápido y divide el problema en pasos más comprensibles.

### Exposición
La idea aquí es exponerte a conceptos antes de que empieces a responder preguntas al respecto en la aplicación para que no te intimide más tarde. No te preocupes por no entender todo. De hecho, haz tu mejor esfuerzo para darle sentido de un vistazo o usa la IA a tu favor para crear una comprensión.

### Código

Observemos estas listas. Podemos ver que:
- \`mis_datos_personalizados && mi_lista_personalizada\` son equivalentes.
- \`conjunto_de_datos && objeto_de_datos\` también son fundamentalmente equivalentes.

\`\`\`js
let mis_datos_personalizados = [1, 2, 3, 'a', 'b', 'c', null, false]
const mi_lista_personalizada = new Array(1, 2, 3, 'a', 'b', 'c', null, false)
mis_datos_personalizados.push('nuevos datos')
mi_lista_personalizada.push('nuevos datos')

let conjunto_de_datos = {
introduccion: "Bienvenido",
titulo: "Capítulo 1",
esta_en_vivo: true
}
conjunto_de_datos.pagina = 4
conjunto_de_datos['libro'] = 'Conceptos Básicos de Programación'

let objeto_de_datos = new Object()
objeto_de_datos.introduccion = 'Bienvenido'
objeto_de_datos.titulo = 'Capítulo 1'
objeto_de_datos.esta_en_vivo = true
objeto_de_datos.pagina = 4
objeto_de_datos['libro'] = 'Conceptos Básicos de Programación'

\`\`\`

Además, en el ejemplo anterior, estamos expuestos a definiciones de variables, tipos de datos, arrays, funciones y objetos. Gran parte del software que probablemente utilizas opera con esos conceptos bajo el capó. Es por eso que \`[]\` y \`new Array\` pueden crear los mismos datos: se traduce de la misma manera cuando se trata de convertir tu código en señales que pueden enviarse a través de Internet.

Ahora, en el ejemplo a continuación, echamos un vistazo a crear nuestros propios objetos personalizados. Creamos nuestro propio objeto personalizado, junto con una interfaz de funciones. Generalmente, cuando se trata de datos, puedes crearlos, recuperarlos, actualizarlos o eliminarlos de una forma u otra.

\`\`\`js
class Casa {
pintura_casa = null

constructor(pintura){
  this.pintura_casa = pintura
}

obtenerPintura(){
  return this.pintura_casa
}

establecerPintura(pintura){
  this.pintura_casa = pintura
}

eliminarPintura(){
  this.pintura_casa = null
}
}

let primera_casa = new Casa("rosa")
let siguiente_casa = new Casa("azul")

let primera_pintura = primera_casa.obtenerPintura() // devuelve el valor "rosa"
let siguiente_pintura = siguiente_casa.pintura_casa // devuelve el valor "azul"
siguiente_pintura = siguiente_casa['pintura_casa'] // aún devuelve el valor 'azul'

\`\`\`

Entonces, eso es crear datos y trabajar con datos. Descubrirás que generalmente puedes combinar ideas dependiendo de lo que necesites crear. Por ejemplo, el componente anterior también puede escribirse de la siguiente manera:

\`\`\`js
function crearCasa(pintura = null) {
return {
  pintura_casa: pintura,

  obtenerPintura() {
    return this.pintura_casa;
  },

  establecerPintura(pintura) {
    this.pintura_casa = pintura;
  },

  eliminarPintura() {
    this.pintura_casa = null;
  },
};
}

//¿cuál es el valor del resultado al final del programa?
const miCasa = crearCasa('azul');
let pintura = miCasa.pintura_casa;

miCasa.pintura_casa = 'rojo'; 
pintura = miCasa.obtenerPintura();

miCasa.establecerPintura('verde'); 
pintura = miCasa.pintura_casa;

miCasa.eliminarPintura(); 

let resultado = miCasa['pintura_casa'];
\`\`\`

Finalmente, combinamos esto para trabajar con algún código que renderiza la siguiente pantalla:

\`\`\`jsx
const MensajeDeCelebracion = ({ nombre }) => {
const datos_de_estilo = {
  textAlign: 'center'
}

return <div style={datos_de_estilo}>{nombre}</div>
}

const Aplicacion = () => {
return (
  <section style={{ border: '3px solid black' }}>
    <header>
      <h2>¡Buen trabajo!</h2>
    </header>
    
    <MensajeDeCelebracion nombre="¡Creaste una pequeña aplicación!" />
    </section>
)
}
\`\`\`

Y eso es todo. En el último ejemplo, hemos utilizado una biblioteca llamada React, que nos da acceso a funciones especiales especializadas para renderizar elementos en una pantalla. Pero sigue el mismo proceso de pensamiento que lo anterior.

### Conclusión
Recuerda que fallar más rápido está en tu mejor interés cuando aprendes nuevas habilidades con software. Este documento de una página estará disponible dentro de la aplicación. También hay muchas otras características para ayudar en tu viaje, pero dejaré eso a tu exploración de la plataforma y todo lo que tiene para ofrecer.

Mantente enfocado y ¡mucha suerte con el resto!
    
                `,
      },
    },
    {
      group: "tutorial",
      title: "Entendiendo la Programación",
      description: "Comprende el concepto básico de la programación.",
      isMultipleChoice: true,
      question: {
        questionText: "¿Cuál de las siguientes describe mejor la programación?",
        options: [
          "Escribir instrucciones para que las computadoras realicen tareas",
          "Crear componentes físicos para computadoras",
          "Diseñar interfaces de usuario",
          "Gestionar bases de datos",
        ],
        answer:
          "Escribir instrucciones para que las computadoras realicen tareas",
      },
    },
    {
      group: "tutorial",
      title: "Secuencia de Ejecución de Programas",
      description: "Aprende el orden correcto de la ejecución de programas.",
      isSelectOrder: true,
      question: {
        questionText:
          "Organiza los pasos arrastrando y soltando el orden en que se ejecutan los programas.",
        options: [
          "Compilación del Código",
          "Escritura del Código",
          "Ejecución del Programa",
          "Depuración",
        ],
        answer: [
          "Escritura del Código",
          "Compilación del Código",
          "Depuración",
          "Ejecución del Programa",
        ],
      },
    },
    {
      group: "tutorial",
      title: "Introducción a las Variables",
      description:
        "En este paso, aprenderás sobre las variables y cómo usarlas en tu código.",
      isMultipleAnswerChoice: true,
      question: {
        questionText:
          "Selecciona todos los pasos involucrados en declarar correctamente una variable en JavaScript:",
        options: [
          "Usar la palabra clave var/let/const",
          "Elegir un nombre descriptivo para la variable",
          "Asignar un valor usando el signo igual (=)",
          "Inicializar la variable dentro de llaves {}",
          "Declarar la variable después de asignar un valor",
          "Capitalizar la primera letra del nombre de la variable",
        ],
        answer: [
          "Usar la palabra clave var/let/const",
          "Elegir un nombre descriptivo para la variable",
          "Asignar un valor usando el signo igual (=)",
        ],
      },
    },
    {
      group: "tutorial",
      title: "Entendiendo la Declaración de Variables para Listas",
      description:
        "Completa el código seleccionando la manera correcta de declarar un arreglo de elementos (array) en JavaScript.",
      isCodeCompletion: true,
      question: {
        questionText:
          "¿Qué bloque de código declara correctamente una lista de elementos?",
        options: [
          `const frutas = ['manzana', 'plátano', 'cereza'];`,
          `const frutas = function() { return 'manzana, plátano, cereza'; };`,
          `const frutas = 'manzana, plátano, cereza';`,
          `const frutas = { fruta1: 'manzana', fruta2: 'plátano', fruta3: 'cereza' };`,
          `class Frutas { constructor() { this.fruta1 = 'manzana'; this.fruta2 = 'plátano'; this.fruta3 = 'cereza'; } } const frutas = new Frutas();`,
        ],
        answer: `const frutas = ['manzana', 'plátano', 'cereza'];`,
      },
    },
    {
      group: "tutorial",
      title: "Declaración de Variables en JavaScript",
      description: "Aprende cómo declarar variables en JavaScript.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Declara una variable llamada `edad` y asígnale el valor `25`.",
      },
    },
    {
      group: "tutorial",
      title: "Entendiendo los Tipos de Datos",
      description:
        "Aprende los conceptos básicos de los tipos de datos en JavaScript.",
      isSingleLineText: true,
      question: {
        questionText:
          "¿Qué palabra clave se usa para declarar una constante en JavaScript?",
        placeholder: "Escribe tu respuesta aquí...",
        answer: "const",
      },
    },
    {
      group: "tutorial",
      title: "Propósito de las Variables",
      description:
        "Comprende por qué se utilizan las variables en la programación.",
      isText: true,
      question: {
        questionText:
          "En tus propias palabras, explica el propósito de las variables en la programación.",
      },
    },
    {
      group: "tutorial",
      title: "Práctica del Terminal Bash: Cambiar Directorios",
      description: "Practica cambiar directorios en un entorno de terminal.",
      isCode: true,
      isTerminal: true,
      question: {
        questionText:
          "Ingresa el comando para cambiar al directorio new_folder usando un terminal bash.",
      },
    },
    {
      group: "tutorial",
      title: "Revisión con Conversación AI (opcional)",
      isConversationReview: true,
      description: "Revisa los temas que has respondido.",
      question: {
        range: [1, 8],
      },
    },
    {
      group: "1",
      title: "Tipos de Datos en Programación",
      description:
        "Identifica los diferentes tipos de datos primitivos utilizados en JavaScript.",
      isMultipleAnswerChoice: true,
      question: {
        questionText:
          "¿Cuáles de los siguientes son tipos de datos primitivos en JavaScript?",
        options: [
          "Cadena (String)",
          "Función (Function)",
          "Número (Number)",
          "Objeto (Object)",
          "Booleano (Boolean)",
          "Nulo (Null)",
          "Arreglo (Array)",
          "BigInt",
          "Indefinido (Undefined)",
          "Símbolo (Symbol)",
        ],
        answer: [
          "Cadena (String)",
          "Número (Number)",
          "Booleano (Boolean)",
          "Nulo (Null)",
          "Indefinido (Undefined)",
          "Símbolo (Symbol)",
          "BigInt",
        ],
      },
    },
    {
      group: "1",
      title: "Pasos para Crear una Función",
      description: "Comprende la secuencia para crear una función.",
      isSelectOrder: true,
      question: {
        questionText:
          "Organiza los pasos arrastrando y soltando para crear y usar una función.",
        options: [
          "Definir la función",
          "Llamar a la función",
          "Ejecutar el cuerpo de la función",
          "Devolver un valor",
        ],
        answer: [
          "Definir la función",
          "Llamar a la función",
          "Ejecutar el cuerpo de la función",
          "Devolver un valor",
        ],
      },
    },
    {
      group: "1",
      title: "Escribir una Función Simple",
      description: "Practica escribiendo funciones en JavaScript.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Escribe una función llamada `saludo` que tome un nombre como parámetro y registre un saludo con ese nombre.",
      },
    },
    {
      group: "1",
      title: "Funciones en Programación",
      description: "Discute el papel de las funciones.",
      isText: true,
      question: {
        questionText:
          "¿Qué es una función y por qué es útil en la programación?",
      },
    },
    {
      group: "1",
      title: "Sentencias Condicionales",
      description: "Identifica el propósito de las sentencias condicionales.",
      isMultipleChoice: true,
      question: {
        questionText:
          "¿Cuál es el propósito principal de una declaración `if`?",
        options: [
          "Repetir un bloque de código varias veces",
          "Ejecutar un bloque de código basado en una condición",
          "Definir una variable",
          "Importar bibliotecas externas",
        ],
        answer: "Ejecutar un bloque de código basado en una condición",
      },
    },
    {
      group: "1",
      title: "Orden de las Verificaciones Condicionales",
      description: "Completa el código que evalúa una sentencia `if-else`.",
      isCodeCompletion: true,
      question: {
        questionText:
          "Completa el siguiente código para implementar correctamente una declaración `if-else` que verifique si una variable `x` es mayor que 10, igual a 10 o menor que 10.",
        options: [
          "if (x > 10) { \n  console.log('x es mayor que 10'); \n} else if (x === 10) { \n  console.log('x es igual a 10'); \n} else { \n  console.log('x es menor que 10'); \n}",
          "if (x == 10) { \n  console.log('x es igual a 10'); \n} else if (x > 10) { \n  console.log('x es mayor que 10'); \n}",
          "if (x > 10) { \n  console.log('x es mayor que 10'); \n} else { \n  console.log('x no es mayor que 10'); \n}",
          "if (x >= 10) { \n  console.log('x es mayor o igual a 10'); \n} else { \n  console.log('x es menor que 10'); \n}",
          "if (x > 10) { \n  console.log('x es mayor que 10'); \n  if (x === 10) { \n    console.log('x es igual a 10'); \n  } \n} else { \n  console.log('x es menor que 10'); \n}",
        ],
        answer:
          "if (x > 10) { \n  console.log('x es mayor que 10'); \n} else if (x === 10) { \n  console.log('x es igual a 10'); \n} else { \n  console.log('x es menor que 10'); \n}",
      },
    },
    {
      group: "1",
      title: "Implementando Lógica Condicional",
      description: "Aplica lógica condicional en código.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Escribe una declaración `if-else` que verifique si un número `num` es positivo, negativo o cero, y registre un mensaje apropiado.",
      },
    },
    {
      group: "1",
      title: "Entendiendo la Lógica Condicional en Programación",
      description:
        "Aprende cómo los operadores lógicos como AND (&&) y OR (||) controlan condiciones en programación.",
      isSingleLineText: true,
      question: {
        questionText:
          "¿Qué operador lógico se usa para verificar si ambas condiciones en una declaración condicional son verdaderas?",
        placeholder: "Escribe tu respuesta aquí...",
        answer: "&&",
      },
    },
    {
      group: "1",
      title: "Uso de Condicionales en el Mundo Real",
      description: "Reflexiona sobre cómo se utilizan los condicionales.",
      isText: true,
      question: {
        questionText:
          "Proporciona un ejemplo de cómo se utilizan las declaraciones condicionales en aplicaciones del mundo real.",
      },
    },
    {
      group: "1",
      title: "Práctica de Terminal: Comando de Ayuda",
      description:
        "Escribe el comando de ayuda para observar los comandos básicos.",
      isCode: true,
      isTerminal: true,
      question: {
        questionText:
          "En un entorno de terminal Bash, ingresa el comando de ayuda para descubrir los comandos básicos.",
      },
    },
    {
      group: "1",
      title: "Bucles en Programación",
      description: "Comprende el propósito de los bucles.",
      isMultipleChoice: true,
      question: {
        questionText:
          "¿Qué bucle continuará ejecutándose mientras su condición sea verdadera?",
        options: [
          "bucle for",
          "bucle while",
          "bucle do...while",
          "bucle foreach",
        ],
        answer: "bucle while",
      },
    },
    {
      group: "1",
      title: "Secuencia de Ejecución de Bucles",
      description: "Comprende el orden en que se ejecutan los bucles.",
      isSelectOrder: true,
      question: {
        questionText:
          "Organiza los pasos de la ejecución de un bucle `for` arrastrando y soltando.",
        options: [
          "Inicialización",
          "Verificación de Condición",
          "Ejecución del Bloque de Código",
          "Incremento/Decremento",
        ],
        answer: [
          "Inicialización",
          "Verificación de Condición",
          "Ejecución del Bloque de Código",
          "Incremento/Decremento",
        ],
      },
    },
    {
      group: "1",
      title: "Creando un Bucle",
      description: "Practica escribiendo bucles.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Escribe un bucle `for` que imprima los números del 1 al 5.",
      },
    },
    {
      group: "1",
      title: "Aplicaciones de los Bucles",
      description: "Discute dónde son útiles los bucles.",
      isText: true,
      question: {
        questionText:
          "Describe un escenario en el desarrollo de software donde los bucles son esenciales.",
      },
    },
    {
      group: "1",
      title: "Arreglos en JavaScript",
      description:
        "Identifica métodos utilizados para manipular arreglos en JavaScript.",
      isMultipleAnswerChoice: true,
      question: {
        questionText:
          "¿Cuáles de los siguientes métodos son válidos para manipular arreglos en JavaScript?",
        options: [
          ".includes()",
          ".push()",
          ".pop()",
          ".forEach()",
          ".length()",
          ".map()",
          ".filter()",
          ".join()",
        ],
        answer: [".push()", ".pop()", ".map()", ".filter()", ".join()"],
      },
    },
    {
      group: "1",
      title: "Orden de las Operaciones en Arreglos",
      description: "Comprende cómo se realizan las operaciones en arreglos.",
      isCodeCompletion: true,
      question: {
        questionText:
          "Completa el código para declarar un arreglo, agregar un elemento, eliminar el último elemento y luego acceder a un elemento.",
        options: [
          "let frutas = ['manzana', 'plátano']; \nfrutas.push('naranja'); \nfrutas.pop(); \nconsole.log(frutas[0]);",
          "let frutas = ['manzana', 'plátano']; \nfrutas.pop(); \nfrutas.push('naranja'); \nconsole.log(frutas[0]);",
          "var frutas = 'manzana', 'plátano'; \nfrutas.push('naranja'); \nfrutas.pop(); \nconsole.log(frutas[0]);",
          "let frutas = ['manzana', 'plátano']; \nfrutas.push('naranja'); \nfrutas.pop();",
          "let frutas = ['manzana', 'plátano']; \nfrutas.push('naranja'); \nfrutas.pop('plátano'); \nconsole.log(frutas[0]);",
        ],
        answer:
          "let frutas = ['manzana', 'plátano']; \nfrutas.push('naranja'); \nfrutas.pop(); \nconsole.log(frutas[0]);",
      },
    },
    {
      group: "1",
      title: "Manipulando Arreglos",
      description: "Aplica métodos de arreglos en código.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Crea un arreglo `frutas` con 'manzana' y 'plátano'. Agrega 'naranja' al final y elimina 'manzana' del principio.",
      },
    },
    {
      group: "1",
      title: "Casos de Uso para Arreglos",
      description: "Explora escenarios donde se utilizan los tipos de arreglo.",
      isText: true,
      question: {
        questionText:
          "Proporciona un ejemplo de cómo se puede usar un arreglo para gestionar datos en una aplicación web.",
      },
    },
    {
      group: "1",
      title: "Práctica de Terminal: Crear Directorios",
      description: "Comando para crear directorios en un terminal bash.",
      isCode: true,
      isTerminal: true,
      question: {
        questionText:
          "En un entorno de terminal bash, crea un directorio llamado app usando el comando para crear directorios.",
      },
    },
    {
      group: "1",
      title: "Resultado Avanzado de Codificación",
      description:
        "Predice el resultado del siguiente código con arreglos, condicionales, operadores lógicos y funciones de arreglos.",
      isSingleLineText: true,
      question: {
        questionText: (
          <div>
            ¿Cuál será el resultado del siguiente código?
            <br />
            <pre>
              {`
let arr = [1, 2, 3, 4];
let x = 10;
let y = 5;

if (x > y && arr.length > 3) {
  arr.push(x);  
  arr = arr.filter(n => n % 2 === 0);
}

console.log(arr);
    
               `}{" "}
            </pre>
          </div>
        ),
        placeholder: "Escribe tu respuesta aquí...",
        answer: "[2, 4, 10]",
      },
    },
    {
      group: "1",
      title: "Revisión con Conversación AI (opcional)",
      isConversationReview: true,
      description: "Revisa los temas que has respondido.",
      question: {
        questionText:
          "Hablemos sobre las preguntas en las que hemos trabajado hasta ahora.",
        range: [10, 29],
      },
    },
    {
      group: "2",
      title: "Introducción a los Objetos",
      description:
        "En este paso, aprenderás qué es un objeto en la programación.",
      isSingleLineText: true,
      question: {
        questionText:
          "En programación, ¿qué palabra clave se usa para crear un objeto en JavaScript?",
        placeholder: "Escribe tu respuesta aquí...",
        answer: "new",
      },
    },
    {
      group: "2",
      title: "Entendiendo el Método Constructor",
      description:
        "En este paso, aprenderás sobre el propósito del método `constructor` en una clase.",
      isCodeCompletion: true,
      question: {
        questionText: `¿Cuál de los siguientes bloques de código define correctamente el método constructor y usa la palabra clave "new" para instanciar una clase?`,
        options: [
          `class Coche {
      constructor(marca) {
        this.marca = marca;
      }
    
      conducir() {
        console.log('El coche está conduciendo');
      }
    }
    
    const miCoche = new Coche('Toyota');`,

          `class Coche {
      constructor() {
        this.marca = 'Toyota';
      }
    
      conducir() {
        console.log('El coche está conduciendo');
      }
    }
    
    const miCoche = new Coche();`,

          `class Coche {
      constructor = (marca) => {
        this.marca = marca;
      }
    
      conducir() {
        console.log('El coche está conduciendo');
      }
    }
    
    const miCoche = new Coche('Toyota');`,

          `class Coche {
      Coche(marca) {
        this.marca = marca;
      }
    
      conducir() {
        console.log('El coche está conduciendo');
      }
    }
    
    const miCoche = new Coche('Toyota');`,
        ],
        answer: `class Coche {
      constructor(marca) {
        this.marca = marca;
      }
    
      conducir() {
        console.log('El coche está conduciendo');
      }
    }
    
    const miCoche = new Coche('Toyota');`,
      },
    },
    {
      group: "2",
      title: "Entendiendo el Método Constructor",
      description:
        "En este paso, aprenderás sobre el propósito del método `constructor` en una clase.",
      isText: true,
      question: {
        questionText:
          "Explica el propósito del método `constructor` en una clase.",
      },
    },
    {
      group: "2",
      title: "Creando una Instancia de una Clase",
      description:
        "En este paso, aprenderás cómo crear una instancia de una clase en JavaScript.",
      isMultipleAnswerChoice: true,
      question: {
        questionText:
          "Selecciona todos los pasos correctos necesarios para crear una instancia de una clase en JavaScript:",
        options: [
          "Definir una clase usando la palabra clave `class`",
          "Definir la clase con la palabra clave `function`",
          "Usar la palabra clave `new` para crear una instancia",
          "Declarar la instancia de la clase con `const instanciaClase = Coche()`",
          "Pasar los argumentos requeridos por el constructor al llamar a la clase",
          "Almacenar la nueva instancia en una variable",
          "Llamar a la clase directamente sin la palabra clave `new`",
          "Instanciar la clase antes de definirla",
        ],
        answer: [
          "Definir una clase usando la palabra clave `class`",
          "Usar la palabra clave `new` para crear una instancia",
          "Pasar los argumentos requeridos por el constructor al llamar a la clase",
          "Almacenar la nueva instancia en una variable",
        ],
      },
    },
    {
      group: "2",
      title: "Declarando un Método en una Clase",
      description:
        "En este paso, aprenderás cómo declarar un método dentro de una clase.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Declara un método llamado `actualizarModelo` en la clase `Coche` que actualice la propiedad `modelo`.",
      },
    },
    {
      group: "2",
      title: "Usando la Palabra Clave `this`",
      description:
        "Completa el código seleccionando la forma correcta de usar la palabra clave `this` en un método de clase.",
      isCodeCompletion: true,
      question: {
        questionText:
          "¿Cuál bloque de código usa correctamente la palabra clave `this` para referirse a la propiedad del objeto?",
        options: [
          `class Coche {
      constructor(marca) {
        this.marca = marca;
      }
    
      mostrarMarca() {
        console.log(this.marca);
      }
    }
    
    const miCoche = new Coche('Toyota');
    miCoche.mostrarMarca();`,

          `class Coche {
      constructor(marca) {
        this.marca = marca;
      }
    
      mostrarMarca() {
        console.log(marca);
      }
    }
    
    const miCoche = new Coche('Toyota');
    miCoche.mostrarMarca();`,

          `class Coche {
      constructor(marca) {
        marca = this.marca;
      }
    
      mostrarMarca() {
        console.log(marca);
      }
    }
    
    const miCoche = new Coche('Toyota');
    miCoche.mostrarMarca();`,

          `class Coche {
      constructor(marca) {
        marca = this.marca;
      }
    
      mostrarMarca() {
        console.log(this.marca);
      }
    }
    
    const miCoche = new Coche('Toyota');
    miCoche.mostrarMarca();`,
        ],
        answer: `class Coche {
      constructor(marca) {
        this.marca = marca;
      }
    
      mostrarMarca() {
        console.log(this.marca);
      }
    }
    
    const miCoche = new Coche('Toyota');
    miCoche.mostrarMarca();`,
      },
    },
    {
      group: "2",
      title: "Añadiendo Propiedades a un Objeto",
      description:
        "En este paso, aprenderás cómo añadir propiedades a un objeto en JavaScript.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText: "Añade una nueva propiedad `año` a la clase `Coche`.",
      },
    },
    {
      group: "2",
      title: "Accediendo y Modificando Propiedades de un Objeto",
      description:
        "En este paso, aprenderás cómo obtener o modificar propiedades de un objeto en JavaScript, ya sea accediendo directamente a las propiedades o usando funciones getter y setter.",
      isMultipleAnswerChoice: true,
      question: {
        questionText:
          "¿Cuáles de las siguientes son formas válidas de obtener o modificar propiedades en un objeto de JavaScript?",
        options: [
          "Usar una llamada a función para eliminar una propiedad (por ejemplo, obj.deleteProperty())",
          "Usar notación de corchetes para acceder a una propiedad (por ejemplo, obj['propiedad'])",
          "Usar una función setter para actualizar el valor de una propiedad",
          "Usar notación de puntos para acceder a una propiedad (por ejemplo, obj.propiedad)",
          "Usar una función getter para devolver el valor de una propiedad",
          "Llamar directamente a obj.propiedad() para acceder a una propiedad",
        ],
        answer: [
          "Usar notación de puntos para acceder a una propiedad (por ejemplo, obj.propiedad)",
          "Usar notación de corchetes para acceder a una propiedad (por ejemplo, obj['propiedad'])",
          "Usar una función getter para devolver el valor de una propiedad",
          "Usar una función setter para actualizar el valor de una propiedad",
        ],
      },
    },
    {
      group: "2",
      title: "Modificando Propiedades de un Objeto",
      description:
        "En este paso, aprenderás cómo modificar propiedades de un objeto en JavaScript.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Modifica la propiedad `modelo` de una instancia de la clase `Coche`.",
      },
    },
    {
      group: "2",
      title: "Entendiendo la Herencia",
      description:
        "En este paso, aprenderás sobre la herencia en la programación orientada a objetos.",
      isText: true,
      question: {
        questionText:
          "¿Qué es la herencia en la programación orientada a objetos?",
      },
    },
    {
      group: "2",
      title: "Implementando la Herencia",
      description:
        "En este paso, implementarás la herencia en JavaScript extendiendo una clase.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Extiende la clase `Coche` para crear una clase `CocheEléctrico` con una propiedad adicional `vidaBatería`.",
      },
    },
    {
      group: "2",
      title: "Sobrescribiendo Métodos",
      description:
        "En este paso, aprenderás cómo sobrescribir métodos en una subclase.",
      isMultipleChoice: true,
      question: {
        questionText: "¿Qué significa sobrescribir un método en una subclase?",
        options: [
          "Eliminar el método de la clase",
          "Reemplazar un método heredado de la superclase",
          "Heredar un método sin cambios",
          "Llamar a un método de otra clase",
          "Extender la funcionalidad de un método en la subclase",
        ],
        answer: "Reemplazar un método heredado de la superclase",
      },
    },
    {
      group: "2",
      title: "Entendiendo la Encapsulación",
      description:
        "En este paso, aprenderás sobre la encapsulación en la programación orientada a objetos.",
      isText: true,
      question: {
        questionText:
          "¿Qué es la encapsulación en la programación orientada a objetos?",
      },
    },
    {
      group: "2",
      title: "Implementando la Encapsulación",
      description:
        "En este paso, implementarás la encapsulación usando métodos getter y setter.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Añade métodos getter y setter para la propiedad `vidaBatería` en la clase `CocheEléctrico`.",
      },
    },
    {
      group: "2",
      title: "Entendiendo la Encapsulación",
      description:
        "En este paso, definirás el concepto de encapsulación en la programación orientada a objetos con una sola palabra.",
      isSingleLineText: true,
      question: {
        questionText:
          "¿Qué concepto principal asegura la encapsulación en la programación orientada a objetos?",
        placeholder: "Escribe tu respuesta aquí...",
        answer: "Privacidad",
      },
    },
    {
      group: "2",
      title: "Combinando Conceptos",
      description:
        "En este paso, combinarás varios conceptos aprendidos para crear un pequeño proyecto.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Crea un pequeño proyecto que defina una clase `Persona`, use la herencia para crear una clase `Estudiante` y demuestre encapsulación y arreglos de objetos.",
      },
    },
    {
      group: "2",
      title: "Imprimiendo en la Terminal",
      description: "En este paso, imprimirás un mensaje usando la terminal.",
      isCode: true,
      isTerminal: true,
      question: {
        questionText:
          "Escribe un comando para imprimir el mensaje: '¡Estoy hablando dentro de una computadora!'",
      },
    },
    {
      group: "2",
      title: "Revisión con Conversación AI (opcional)",
      isConversationReview: true,
      description: "Revisa los temas que has respondido",
      question: {
        questionText:
          "Hablemos sobre las preguntas en las que hemos trabajado hasta ahora.",
        range: [31, 47],
      },
    },
    {
      group: "3",
      title: "Introducción a los Componentes de React",
      description:
        "En este paso, aprenderás sobre los componentes de React, su papel en la creación de elementos de interfaz de usuario reutilizables y cómo ayudan a gestionar la interfaz de usuario de manera eficiente.",
      isMultipleChoice: true,
      question: {
        questionText:
          "¿Cuál de las siguientes opciones describe mejor un componente de React?",
        options: [
          "Un método para manejar eventos en JavaScript",
          "Una característica exclusiva del renderizado del lado del servidor en React",
          "Un elemento reutilizable de la interfaz de usuario definido como una función o clase que devuelve JSX",
          "Un elemento HTML incorporado en React",
        ],
        answer:
          "Un elemento reutilizable de la interfaz de usuario definido como una función o clase que devuelve JSX",
      },
    },
    {
      group: "3",
      title: "Conceptos Clave en React",
      description:
        "En este paso, aprenderás sobre los conceptos fundamentales de React, incluidas las propiedades (props), el estado, los eventos y los estilos.",
      isMultipleAnswerChoice: true,
      question: {
        questionText: "¿Cuáles de los siguientes son conceptos clave en React?",
        options: [
          "Gestionar propiedades para pasar datos entre componentes",
          "Manipular directamente el DOM para mejorar el rendimiento",
          "Usar el estado para gestionar datos dentro de un componente",
          "Manejar eventos como clics con controladores de eventos",
          "Aplicar estilos en línea o clases CSS a los componentes",
        ],
        answer: [
          "Gestionar propiedades para pasar datos entre componentes",
          "Usar el estado para gestionar datos dentro de un componente",
          "Manejar eventos como clics con controladores de eventos",
          "Aplicar estilos en línea o clases CSS a los componentes",
        ],
      },
    },
    {
      group: "3",
      title: "Efecto de los Cambios en el Estado de un Componente",
      description:
        "En este paso, explicarás qué sucede con un componente de React cuando su estado cambia.",
      isText: true,
      question: {
        questionText:
          "¿Qué sucede con un componente de React cuando su estado cambia?",
      },
    },
    {
      group: "3",
      title: "Creando un Componente Simple de React",
      description:
        "En este paso, definirás un componente básico de React que devuelve un simple JSX.",
      isCodeCompletion: true,
      question: {
        questionText:
          "¿Cuál de los siguientes bloques de código define correctamente un componente simple de React que devuelve un encabezado y un párrafo?",
        options: [
          `function MiComponente() {
      return (
        <div>
          <h1>¡Hola, Mundo!</h1>
        </div>
      );
    }`,
          `function MiComponente() {
      <div>
        <h1>¡Hola, Mundo!</h1>
      </div>;
    }`,
          `class MiComponente {
      render() {
        return (
          <div>
            <h1>¡Hola, Mundo!</h1>
          </div>
        );
      }
    }`,
          `function MiComponente() {
      return (
        <div>Hola</div>
        <div>Mundo</div>
      );
    }`,
        ],
        answer: `function MiComponente() {
      return (
        <div>
          <h1>¡Hola, Mundo!</h1>
        </div>
      );
    }`,
      },
    },
    {
      group: "3",
      title: "Manejo de Eventos en React",
      description:
        "En este paso, definirás un componente básico de React que maneja un evento de clic en un botón usando el atributo `onClick`.",
      isCodeCompletion: true,
      question: {
        questionText:
          "¿Cuál de los siguientes bloques de código define correctamente un componente de React que maneja un evento de clic en un botón?",
        options: [
          `function MiComponente() {
      return (
        <div>
          <button 
            onClick={
              alert('¡Botón clicado!')
            }
          >
            Haz clic
          </button>
        </div>
      );
    }`,
          `function MiComponente() {
    return (
      <div>
        <button 
          onClick={() => {
            alert('¡Botón clicado!')
          }}
        >
          Haz clic
        </button>
      </div>
    );
    }`,
          `function MiComponente() {
      const manejarClick = () => {
        alert('¡Botón clicado!');
      };
        
      return (
        <div>
          <button 
            onClick={manejarClick}
          >
            Haz clic
          </button>
        </div>
      );
    }`,
          `function MiComponente() {
    return (
      <div>
        <button>
          Haz clic
        </button>
      </div>
    );
        }`,
        ],
        answer: `function MiComponente() {
      const manejarClick = () => {
        alert('¡Botón clicado!');
      };
    
      return (
        <div>
          <button 
            onClick={manejarClick}
          >
            Haz clic
          </button>
        </div>
      );
    }`,
      },
    },
    {
      group: "3",
      title: "Gestionando el Estado con el Hook useState",
      description:
        "En este paso, aprenderás cómo usar el hook useState para gestionar el estado de un componente.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Modifica el componente Tweet para incluir un botón de 'me gusta' que cambie el estado usando el hook useState.",
      },
    },
    {
      group: "3",
      title: "Propiedades del Componente",
      description:
        "En este paso, aprenderás cómo pasar propiedades a los componentes en React.",
      isSingleLineText: true,
      question: {
        questionText:
          "¿Cuál es el término utilizado para pasar datos a un componente de React?",
        placeholder: "Escribe tu respuesta aquí...",
        answer: "props",
      },
    },
    {
      group: "3",
      title: "Pasando y Usando Props",
      description:
        "En este paso, aprenderás cómo pasar y usar props en un componente de React.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Actualiza el componente Tweet para aceptar y mostrar el nombre de usuario, el handle y el contenido del tweet como props.",
      },
    },
    {
      group: "3",
      title: "Trabajando con Props y Estado Juntos",
      description:
        "En este paso, aprenderás cómo trabajar con tanto props como estado en un componente de React.",
      isMultipleChoice: true,
      question: {
        questionText:
          "¿Cuál es la principal diferencia entre props y estado en React?",
        options: [
          "Las props son inmutables mientras que el estado es mutable",
          "Las props son gestionadas por el propio componente mientras que el estado se pasa desde componentes padres",
          "El estado se usa para estilos mientras que las props se usan para la lógica",
          "No hay diferencia; son lo mismo",
        ],
        answer: "Las props son inmutables mientras que el estado es mutable",
      },
    },
    {
      group: "3",
      title: "Práctica en la Terminal: Listando Archivos",
      description:
        "En este paso, aprenderás cómo listar archivos en una terminal bash.",
      isCode: true,
      isTerminal: true,
      question: {
        questionText:
          "Usa la terminal para listar todos los archivos usando el comando list.",
      },
    },
    {
      group: "3",
      title: "Estilizando Componentes de React",
      description:
        "En este paso, aprenderás cómo aplicar estilos a los componentes de React usando CSS.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Agrega estilos al componente Tweet para mejorar su apariencia.",
      },
    },
    {
      group: "3",
      title: "Usando Flexbox para Diseños",
      description:
        "En este paso, aprenderás cómo usar Flexbox para crear diseños en React.",
      isSelectOrder: true,
      question: {
        questionText:
          "Ordena las siguientes propiedades de CSS en el orden necesario para centrar un diseño básico con estilos de flexbox:",
        options: [
          "display: flex;",
          "justify-content: center;",
          "align-items: center;",
          "flex-direction: row;",
        ],
        answer: [
          "display: flex;",
          "flex-direction: row;",
          "justify-content: center;",
          "align-items: center;",
        ],
      },
    },
    {
      group: "3",
      title: "Elevando el Estado",
      description:
        "En este paso, aprenderás cómo elevar el estado a un componente ancestro común para compartir estado entre componentes.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Crea un componente padre que gestione el estado para múltiples componentes Tweet y pase el estado y los controladores de eventos como props.",
      },
    },
    {
      group: "3",
      title: "Usando useEffect para Efectos Secundarios",
      description:
        "En este paso, aprenderás cómo usar el hook useEffect para manejar efectos secundarios en un componente de React.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Modifica el componente Tweet para usar el hook useEffect y registrar un mensaje en la consola cada vez que cambie el número de retweets.",
      },
    },
    {
      group: "3",
      title: "Comprendiendo el Ciclo de Vida del Componente",
      description:
        "En este paso, aprenderás sobre el ciclo de vida de los componentes de React y cómo usar el hook useEffect para gestionar efectos secundarios.",
      isText: true,
      question: {
        questionText:
          "¿Qué es el ciclo de vida del componente en React y cuál es el propósito del hook useEffect?",
      },
    },
    {
      group: "3",
      title: "Obteniendo Datos con useEffect",
      description:
        "En este paso, aprenderás cómo obtener datos de una API usando el hook useEffect.",
      isSelectOrder: true,
      question: {
        questionText:
          "Ordena los pasos con arrastrar y soltar para obtener datos correctamente usando useEffect.",
        options: [
          "Importa React y useState",
          "Importa useEffect de React",
          "Crea un componente",
          "Define el hook useEffect",
          "Haz la llamada a la API dentro de useEffect",
          "Usa async/await o .then() para manejar la respuesta de la API",
          "Actualiza el estado del componente con los datos obtenidos",
          "Maneja los errores en la llamada a la API",
          "Renderiza los datos en el componente",
        ],
        answer: [
          "Importa React y useState",
          "Importa useEffect de React",
          "Crea un componente",
          "Define el hook useEffect",
          "Haz la llamada a la API dentro de useEffect",
          "Usa async/await o .then() para manejar la respuesta de la API",
          "Actualiza el estado del componente con los datos obtenidos",
          "Maneja los errores en la llamada a la API",
          "Renderiza los datos en el componente",
        ],
      },
    },
    {
      group: "3",
      title: "Construyendo una App Completa de Tweets",
      description:
        "En este paso, combinarás todo lo que has aprendido para construir una app completa de tweets.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Construye una app completa de tweets que obtenga tweets de una API, los muestre usando el componente Tweet y permita a los usuarios dar 'me gusta' y retweetear.",
      },
    },
    {
      group: "3",
      title: "Práctica en la Terminal: Configurando una App de React",
      description:
        "En este paso, aprenderás cómo configurar un proyecto de React.",
      isText: true,
      question: {
        questionText:
          "Escribe el comando para instalar la versión más reciente de un proyecto de React con Vite.",
      },
    },
    {
      group: "3",
      title: "Creando un Nuevo Proyecto de React con Vite",
      description:
        "En este paso, aprenderás cómo crear un nuevo proyecto de React usando Vite siguiendo los pasos correctos y ejecutando comandos de línea de comandos.",
      isSelectOrder: true,
      question: {
        questionText:
          "Ordena los pasos con arrastrar y soltar para crear correctamente un nuevo proyecto de React usando Vite, incluidos los comandos de línea.",
        options: [
          "Asegúrate de que Node.js esté instalado ejecutando `node -v`",
          "Ejecuta `npm create vite@latest` para crear un nuevo proyecto de Vite",
          "Selecciona la plantilla de React cuando se te solicite",
          "Navega al directorio del proyecto usando `cd nombre-del-proyecto`",
          "Ejecuta `npm install` para instalar las dependencias",
          "Inicia el servidor de desarrollo con `npm run dev`",
        ],
        answer: [
          "Asegúrate de que Node.js esté instalado ejecutando `node -v`",
          "Ejecuta `npm create vite@latest` para crear un nuevo proyecto de Vite",
          "Selecciona la plantilla de React cuando se te solicite",
          "Navega al directorio del proyecto usando `cd nombre-del-proyecto`",
          "Ejecuta `npm install` para instalar las dependencias",
          "Inicia el servidor de desarrollo con `npm run dev`",
        ],
      },
    },
    {
      group: "3",
      title: "Revisión con Conversación AI (opcional)",
      isConversationReview: true,
      description: "Revisa los temas que has respondido",
      question: {
        questionText:
          "Hablemos sobre las preguntas en las que hemos trabajado hasta ahora.",
        range: [49, 67],
      },
    },
    {
      group: "4",
      title: "Introducción a la Ingeniería de Backend",
      description:
        "En este paso, aprenderás qué es la ingeniería de software backend y por qué es importante.",
      isText: true,
      question: {
        questionText:
          "¿Qué es la ingeniería de software backend y por qué es importante en la construcción de aplicaciones?",
      },
    },
    {
      group: "4",
      title: "Descripción General de las Lecciones Principales",
      description:
        "En este paso, identificarás una responsabilidad clave de la ingeniería de backend cubierta en el curso.",
      isMultipleChoice: true,
      question: {
        questionText:
          "¿Cuál de las siguientes es una responsabilidad clave en la ingeniería de backend?",
        options: [
          "Gestionar la concurrencia y garantizar la seguridad de los hilos en aplicaciones multiusuario",
          "Implementar la autenticación de usuarios directamente en la experiencia del usuario",
          "Manejar la asignación de memoria y la recolección de basura en entornos de servidor",
          "Diseñar componentes de interfaz de usuario escalables para compatibilidad entre navegadores",
          "Optimizar consultas a la base de datos y garantizar la consistencia de los datos",
        ],
        answer:
          "Optimizar consultas a la base de datos y garantizar la consistencia de los datos",
      },
    },
    {
      group: "4",
      title: "Responsabilidades Clave de la Ingeniería de Backend",
      description:
        "En este paso, aprenderás sobre las diversas responsabilidades involucradas en la ingeniería de backend.",
      isMultipleAnswerChoice: true,
      question: {
        questionText:
          "¿Cuáles de las siguientes son responsabilidades clave de la ingeniería de backend?",
        options: [
          "Gestionar y optimizar bases de datos para almacenar y recuperar datos de manera eficiente",
          "Diseñar e implementar APIs para facilitar la comunicación entre sistemas",
          "Garantizar la seguridad mediante mecanismos de autenticación y autorización de usuarios",
          "Manejar la lógica del lado del servidor, incluidas las operaciones comerciales y cálculos",
          "Mantener la confiabilidad y el rendimiento del servidor bajo alto tráfico",
          "Gestionar la integridad y consistencia de los datos en sistemas distribuidos",
          "Implementar registro y monitoreo para asegurar la salud del sistema y depurar problemas",
        ],
        answer: [
          "Gestionar y optimizar bases de datos para almacenar y recuperar datos de manera eficiente",
          "Diseñar e implementar APIs para facilitar la comunicación entre sistemas",
          "Garantizar la seguridad mediante mecanismos de autenticación y autorización de usuarios",
          "Manejar la lógica del lado del servidor, incluidas las operaciones comerciales y cálculos",
          "Mantener la confiabilidad y el rendimiento del servidor bajo alto tráfico",
          "Gestionar la integridad y consistencia de los datos en sistemas distribuidos",
          "Implementar registro y monitoreo para asegurar la salud del sistema y depurar problemas",
        ],
      },
    },
    {
      group: "4",
      title: "Interactuando con la Terminal",
      description:
        "En este paso, aprenderás sobre la importancia de la terminal en la ingeniería de backend y cómo interactuar con ella para diversas tareas.",
      isText: true,
      question: {
        questionText:
          "¿Por qué es importante aprender a usar la terminal para los sistemas operativos y qué tipo de tareas se pueden realizar con ella?",
      },
    },
    {
      group: "4",
      title: "Instalando NPM",
      description: "En este paso, aprenderás cómo instalar npm globalmente.",
      isText: true,
      question: {
        questionText:
          "Escribe el comando para instalar globalmente el gestor de paquetes de Node (npm) en tu computadora.",
      },
    },
    {
      group: "4",
      title: "Instalación de un Paquete NPM",
      description:
        "En este paso, utilizarás la terminal para instalar un paquete con npm.",
      isText: true,
      question: {
        questionText:
          "Escribe un comando para instalar la biblioteca de componentes de Chakra para interfaces de usuario en React.",
      },
    },
    {
      group: "4",
      title: "Creación de Usuarios y Autenticación",
      description:
        "En este paso, entenderás el concepto clave relacionado con la creación de usuarios en sistemas backend.",
      isSingleLineText: true,
      question: {
        questionText:
          "¿Cómo se llama el proceso que verifica la identidad de un usuario durante la creación de una cuenta?",
        placeholder: "Escribe tu respuesta aquí...",
        answer: "autenticación",
      },
    },
    {
      group: "4",
      title: "Fundamentos de Bases de Datos",
      description:
        "En este paso, aprenderás sobre los fundamentos de las bases de datos en la ingeniería de backend.",
      isText: true,
      question: {
        questionText:
          "¿Cuáles son los principales tipos de bases de datos utilizados en la ingeniería de backend?",
      },
    },
    {
      group: "4",
      title: "Conectando Sistemas",
      description:
        "Escribe un fragmento de código para conectar una aplicación a una base de datos Firebase.",
      isCode: true,
      question: {
        questionText:
          "Escribe un fragmento de código para conectar una aplicación a una base de datos Firebase.",
      },
    },
    {
      group: "4",
      title: "Iniciar un Proyecto de Firebase",
      description:
        "En este paso, entenderás cómo iniciar un proyecto de Firebase desde la línea de comandos.",
      isText: true,
      question: {
        questionText:
          "Escribe el comando para iniciar un proyecto de Firebase.",
      },
    },
    {
      group: "4",
      title: "Prácticas Avanzadas de Almacenamiento de Datos",
      description:
        "En este paso, aprenderás prácticas avanzadas para almacenar datos de manera responsable en sistemas backend.",
      isMultipleAnswerChoice: true,
      question: {
        questionText:
          "¿Cuáles de las siguientes son mejores prácticas para garantizar el almacenamiento responsable de datos en un sistema backend?",
        options: [
          "Almacenar en caché los datos en memoria para reducir el tiempo de acceso a la base de datos",
          "Cifrar datos sensibles tanto en reposo como en tránsito para garantizar la seguridad",
          "Implementar replicación de bases de datos a través de múltiples centros de datos para mejorar la tolerancia a fallos",
        ],
        answer: [
          "Almacenar en caché los datos en memoria para reducir el tiempo de acceso a la base de datos",
          "Cifrar datos sensibles tanto en reposo como en tránsito para garantizar la seguridad",
          "Implementar replicación de bases de datos a través de múltiples centros de datos para mejorar la tolerancia a fallos",
        ],
      },
    },
    {
      group: "4",
      title: "Inicializando Firebase y Trabajando con Firestore v9",
      description:
        "En este paso, aprenderás cómo inicializar Firebase y configurar colecciones y documentos en Firestore v9.",
      isCodeCompletion: true,
      question: {
        questionText:
          "Completa el código para inicializar Firebase con la configuración proporcionada y agregar un documento único a una colección en Firestore.",
        options: [
          // Opción 1: Código correcto para inicializar Firebase y agregar un documento

          // Opción 2: Incorrecto - falta la inicialización de Firestore
          `import { 
      initializeApp 
    } from 'firebase/app';
    
    import { 
      collection, 
      setDoc 
    } from 'firebase/firestore';
    
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: "progr-ai.firebaseapp.com",
      projectId: "progr-ai",
      storageBucket: "progr-ai.appspot.com",
      messagingSenderId: "32042075426",
      appId: "1:320420758826:web:68dfeffe8aa7b6421e8a53",
      measurementId: "G-0E37NCB4KB",
    };
    
    initializeApp(firebaseConfig);
    await setDoc(collection(db, 'usuarios'), {
      name: 'John Doe',
      email: 'john@example.com'
    });`,

          // Opción 3: Incorrecto - falta el ID del documento en Firestore
          `import { 
      initializeApp 
    } from 'firebase/app';
    
    import { 
      getFirestore, 
      doc, 
      setDoc 
    } from 'firebase/firestore';
    
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: "progr-ai.firebaseapp.com",
      projectId: "progr-ai",
      storageBucket: "progr-ai.appspot.com",
      messagingSenderId: "32042075426",
      appId: "1:320420758826:web:68dfeffe8aa7b6421e8a53",
      measurementId: "G-0E37NCB4KB",
    };
    
    // Inicializar Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // Agregar documento
    await setDoc(doc(db, 'usuarios'), {
      name: 'John Doe',
      email: 'john@example.com'
    });`,
          `import { 
      initializeApp 
    } from 'firebase/app';
    
    import { 
      getFirestore, 
      doc, 
      setDoc
    } from 'firebase/firestore';
    
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: "progr-ai.firebaseapp.com",
      projectId: "progr-ai",
      storageBucket: "progr-ai.appspot.com",
      messagingSenderId: "32042075426",
      appId: "1:320420758826:web:68dfeffe8aa7b6421e8a53",
      measurementId: "G-0E37NCB4KB",
    };
    
    // Inicializar Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // Agregar documento
    await addDoc(doc(db, 'usuarios'), {
      name: 'John Doe',
      email: 'john@example.com'
    });`,

          // Opción 4: Incorrecto - falta importar los métodos de Firestore
          `import { 
      initializeApp 
    } from 'firebase/app';
        
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: "progr-ai.firebaseapp.com",
      projectId: "progr-ai",
      storageBucket: "progr-ai.appspot.com",
      messagingSenderId: "32042075426",
      appId: "1:320420758826:web:68dfeffe8aa7b6421e8a53",
      measurementId: "G-0E37NCB4KB",
    };
    
    // Inicializar Firebase
    const app = initializeApp(firebaseConfig);
    
    // Agregar documento
    await addDoc(doc(db, 'usuarios', 'user123'), {
      name: 'John Doe',
      email: 'john@example.com'
    });`,
        ],
        answer: `import { 
      initializeApp 
    } from 'firebase/app';
    
    import { 
      getFirestore, 
      doc, 
      setDoc 
    } from 'firebase/firestore';
    
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: "progr-ai.firebaseapp.com",
      projectId: "progr-ai",
      storageBucket: "progr-ai.appspot.com",
      messagingSenderId: "32042075426",
      appId: "1:320420758826:web:68dfeffe8aa7b6421e8a53",
      measurementId: "G-0E37NCB4KB",
    };
    
    // Inicializar Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // Agregar documento
    await setDoc(doc(db, 'usuarios'), {
      name: 'John Doe',
      email: 'john@example.com'
    });`,
      },
    },
    {
      group: "4",
      title: "Manejo de Datos de Usuarios",
      description:
        "En este paso, aprenderás cómo manejar los datos de los usuarios en sistemas backend.",
      isCode: true,
      question: {
        questionText:
          "Escribe un fragmento de código para obtener un objeto de usuario con las propiedades de nombre de usuario y correo electrónico usando Firebase Auth.",
      },
    },
    {
      group: "4",
      title: "Recuperar un Documento de Usuario Después de la Autenticación",
      description:
        "En este paso, aprenderás cómo recuperar un documento de usuario desde Firestore usando los datos de autenticación.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Escribe un código para recuperar un documento de usuario de la colección `users` en Firestore usando el ID de usuario autenticado.",
      },
    },
    {
      group: "4",
      title: "Comprendiendo el Flujo de Autenticación",
      description:
        "En este paso, aprenderás sobre el flujo típico de autenticación en sistemas backend.",
      isSelectOrder: true,
      question: {
        questionText:
          "Organiza los siguientes pasos en el orden correcto para un flujo típico de autenticación en un sistema backend.",
        options: [
          "El usuario ingresa credenciales (correo electrónico y contraseña) en el formulario de inicio de sesión",
          "El backend verifica las credenciales con el servicio de autenticación",
          "Se crean tokens de identidad o sesiones para el usuario autenticado",
          "El sistema recupera datos del usuario de la base de datos utilizando los tokens",
          "El usuario obtiene acceso a los recursos protegidos",
        ],
        answer: [
          "El usuario ingresa credenciales (correo electrónico y contraseña) en el formulario de inicio de sesión",
          "El backend verifica las credenciales con el servicio de autenticación",
          "Se crean tokens de identidad o sesiones para el usuario autenticado",
          "El sistema recupera datos del usuario de la base de datos utilizando los tokens",
          "El usuario obtiene acceso a los recursos protegidos",
        ],
      },
    },
    {
      group: "4",
      title: "Autenticación OAuth",
      description:
        "En este paso, aprenderás sobre los sistemas de autenticación estilo OAuth.",
      isSingleLineText: true,
      question: {
        questionText:
          "¿Cuál es el protocolo ampliamente utilizado para la autorización que permite a servicios de terceros acceder a datos de usuario sin exponer credenciales?",
        placeholder: "Escribe tu respuesta aquí...",
        answer: "OAuth",
      },
    },
    {
      group: "4",
      title: "Uso de Variables de Entorno",
      description:
        "En este paso, aprenderás sobre el uso de variables de entorno en el desarrollo backend.",
      isText: true,
      question: {
        questionText:
          "¿Qué papel juegan las variables de entorno en una base de código?",
      },
    },
    {
      group: "4",
      title: "Relaciones en Bases de Datos",
      description:
        "En este paso, aprenderás sobre las relaciones en las bases de datos.",
      isCode: true,
      question: {
        questionText:
          "Escribe un fragmento de código para definir una relación uno a muchos entre usuarios y publicaciones en una base de datos.",
      },
    },
    {
      group: "4",
      title: "Interfaz con una API",
      description:
        "En este paso, aprenderás los métodos HTTP comunes utilizados para interactuar con una API y algunos métodos menos comunes.",
      isMultipleAnswerChoice: true,
      question: {
        questionText:
          "¿Cuáles de los siguientes métodos HTTP son comúnmente utilizados para interactuar con una API y qué hacen?",
        options: [
          "GET (Recupera datos del servidor)",
          "POST (Crea un nuevo recurso en el servidor)",
          "SEND (Envía datos al servidor para su procesamiento)",
          "FETCH (Se utiliza para recuperar datos de un recurso)",
          "PATCH (Actualiza parcialmente un recurso en el servidor)",
          "REMOVE (Elimina datos de un servidor)",
          "PUT (Actualiza un recurso existente en el servidor)",
          "DELETE (Elimina un recurso del servidor)",
        ],
        answer: [
          "GET (Recupera datos del servidor)",
          "POST (Crea un nuevo recurso en el servidor)",
          "PUT (Actualiza un recurso existente en el servidor)",
          "DELETE (Elimina un recurso del servidor)",
          "PATCH (Actualiza parcialmente un recurso en el servidor)",
        ],
      },
    },
    {
      group: "4",
      title: "Creación de un Sistema de Autenticación de Usuarios",
      description:
        "En este paso, crearás un sistema de autenticación de usuarios simple.",
      isSelectOrder: true,
      question: {
        questionText:
          "Organiza los pasos para implementar la autenticación de usuarios usando JSON Web Tokens.",
        options: [
          "Instalar la biblioteca JWT",
          "Configurar un modelo de usuario en la base de datos",
          "Crear una ruta de registro para nuevos usuarios",
          "Cifrar la contraseña del usuario antes de almacenarla",
          "Crear una ruta de inicio de sesión",
          "Verificar las credenciales del usuario",
          "Generar un token JWT",
          "Enviar el token JWT de vuelta al cliente",
          "Crear una ruta protegida que requiera autenticación",
          "Verificar el token JWT en rutas protegidas",
        ],
        answer: [
          "Instalar la biblioteca JWT",
          "Configurar un modelo de usuario en la base de datos",
          "Crear una ruta de registro para nuevos usuarios",
          "Cifrar la contraseña del usuario antes de almacenarla",
          "Crear una ruta de inicio de sesión",
          "Verificar las credenciales del usuario",
          "Generar un token JWT",
          "Enviar el token JWT de vuelta al cliente",
          "Crear una ruta protegida que requiera autenticación",
          "Verificar el token JWT en rutas protegidas",
        ],
      },
    },
    {
      group: "4",
      title: "Desplegar una Aplicación de Firebase",
      description:
        "En este paso, aprenderás cómo desplegar una aplicación backend de Firebase en un servicio en la nube.",
      isText: true,
      question: {
        questionText:
          "Escribe un comando para desplegar una aplicación de Firebase en la línea de comandos.",
      },
    },
    {
      group: "4",
      title: "Revisión con Conversación de IA",
      isConversationReview: true,
      description: "Revisa los temas que has respondido.",
      question: {
        questionText:
          "Hablemos de las preguntas en las que hemos trabajado hasta ahora.",
        range: [69, 89],
      },
    },
    {
      group: "5",
      title: "Beneficios de las Plataformas en la Nube Sin Servidor",
      description:
        "En este paso, explorarás las ventajas de usar plataformas en la nube sin servidor como Firebase o Vercel en el desarrollo de software.",
      isText: true,
      question: {
        questionText:
          "¿Cuáles son los principales beneficios de usar plataformas en la nube sin servidor como Firebase o Vercel en el desarrollo de software, y en qué se diferencian de los modelos tradicionales basados en servidores?",
      },
    },
    {
      group: "5",
      title: "Comprender VSCode",
      description:
        "En este paso, explorarás qué es Visual Studio Code (VSCode) y por qué es un editor de código popular.",
      isText: true,
      question: {
        questionText:
          "¿Qué es Visual Studio Code (VSCode) y por qué es uno de los editores de código más populares entre los desarrolladores?",
      },
    },
    {
      group: "5",
      title: "Instalar Node.js y NPM",
      description:
        "Instala Node.js, lo que te permitirá crear aplicaciones en JavaScript.",
      isText: true,
      question: {
        questionText:
          "¿Cuál es el propósito de Node.js y npm en el desarrollo de JavaScript en términos simples?",
      },
    },
    {
      group: "5",
      title: "Instalar Paquetes de 'package.json'.",
      description: "Instalar los archivos encontrados en package.json.",
      isSingleLineText: true,
      question: {
        questionText:
          "Introduce el comando para instalar los paquetes en un proyecto de React usando npm.",
        answer: "npm install",
      },
    },
    {
      group: "5",
      title: "Instalar Herramientas de Firebase Globalmente",
      description:
        "Instala las herramientas de Firebase globalmente usando la línea de comandos.",
      isSingleLineText: true,
      question: {
        questionText:
          "Usa el terminal para instalar firebase-tools globalmente. ¿Qué comando utilizas?",
        answer: "npm install -g firebase-tools",
      },
    },
    {
      group: "5",
      title: "Configurar un Proyecto de React y Firebase con VSCode",
      description:
        "En este paso, organizarás los pasos necesarios para configurar un proyecto de React usando Vite, conectar los servicios de Firebase e instalar las herramientas necesarias utilizando Visual Studio Code (VSCode).",
      isSelectOrder: true,
      question: {
        questionText:
          "Organiza los siguientes pasos en el orden correcto para configurar un proyecto de React usando Vite, instalar Node.js y npm, y conectar los servicios de Firebase usando VSCode.",
        options: [
          "Instalar Node.js y npm en tu máquina",
          "Instalar Visual Studio Code (VSCode)",
          "Abrir VSCode y navegar al terminal",
          "Ejecutar `npm create vite@latest` para crear un nuevo proyecto de React",
          "Navegar a la carpeta del proyecto usando `cd nombre-del-proyecto`",
          "Ejecutar `npm install` para instalar dependencias",
          "Instalar Firebase CLI usando `npm install -g firebase-tools`",
          "Iniciar sesión en Firebase usando `firebase login`",
          "Inicializar Firebase en el proyecto usando `firebase init`",
          "Habilitar servicios de Firebase como Firestore o Authentication",
          "Conectar Firebase a tu proyecto de React agregando la configuración de Firebase",
          "Iniciar el servidor de desarrollo usando `npm run dev`",
        ],
        answer: [
          "Instalar Node.js y npm en tu máquina",
          "Instalar Visual Studio Code (VSCode)",
          "Abrir VSCode y navegar al terminal",
          "Ejecutar `npm create vite@latest` para crear un nuevo proyecto de React",
          "Navegar a la carpeta del proyecto usando `cd nombre-del-proyecto`",
          "Ejecutar `npm install` para instalar dependencias",
          "Instalar Firebase CLI usando `npm install -g firebase-tools`",
          "Iniciar sesión en Firebase usando `firebase login`",
          "Inicializar Firebase en el proyecto usando `firebase init`",
          "Habilitar servicios de Firebase como Firestore o Authentication",
          "Conectar Firebase a tu proyecto de React agregando la configuración de Firebase",
          "Iniciar el servidor de desarrollo usando `npm run dev`",
        ],
      },
    },
    {
      group: "5",
      title: "Configurar Firebase",
      description:
        "En este paso, configurarás Firebase para tu proyecto, incluyendo Authentication, Firestore y Analytics.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Escribe el código en JavaScript para inicializar Firebase en tu proyecto, y conectar los servicios de Authentication, Firestore y Analytics.",
      },
    },
    {
      group: "5",
      title: "Introducción a GitHub",
      description:
        "Aprende sobre el uso de GitHub para colaborar con otros desarrolladores.",
      isMultipleChoice: true,
      question: {
        questionText: "¿Para qué se usa principalmente GitHub?",
        options: [
          "Alojar sitios web",
          "Gestionar repositorios de código",
          "Descentralizar software",
          "Recopilar datos",
        ],
        answer: "Gestionar repositorios de código",
      },
    },
    {
      group: "5",
      title: "Clonar Proyectos de Github",
      description: "Clonar proyectos de Github en la línea de comandos.",
      isCode: true,
      isTerminal: true,
      question: {
        questionText:
          "Usa el terminal para clonar un proyecto de progr.ai de Github por Robots Building Education utilizando comandos de git.",
        answer:
          "git clone https://github.com/RobotsBuildingEducation/progr.ai.git",
      },
    },
    {
      group: "5",
      title: "Alternativas Populares a Firebase",
      description:
        "En este paso, explorarás algunas alternativas populares a Firebase para varios servicios backend como la gestión de bases de datos, autenticación y hosting.",
      isMultipleAnswerChoice: true,
      question: {
        questionText:
          "¿Cuáles de las siguientes son alternativas populares a Firebase para construir aplicaciones full-stack?",
        options: [
          "Supabase",
          "AWS Amplify",
          "MongoDB Realm",
          "HerokuDB",
          "AngularJS",
          "Vercel",
          "Cloudflare",
        ],
        answer: ["Supabase", "AWS Amplify", "MongoDB Realm", "Cloudflare"],
      },
    },
    {
      group: "5",
      title: "Productos Más Comunes de Firebase",
      description:
        "En este paso, identificarás los productos centrales de Firebase comúnmente utilizados en el desarrollo de aplicaciones web y móviles.",
      isMultipleAnswerChoice: true,
      question: {
        questionText:
          "¿Cuáles de los siguientes son productos comúnmente utilizados de Firebase?",
        options: [
          "Firestore: Base de datos NoSQL en la nube para almacenar y sincronizar datos",
          "Firebase Ads: Plataforma para integrar publicidad",
          "Authentication: Gestión de inicio de sesión e identidad de usuario",
          "Firebase Functions: Backend sin servidor para ejecutar código",
          "Firebase Storage: Almacenamiento de archivos para contenido generado por usuarios",
          "Firebase Machine Learning: Herramientas de ML para características de la app",
          "Firebase Builder: Herramienta para crear servicios de Firebase",
          "Firebase Hosting: Alojamiento web para desplegar contenido estático",
          "Firebase Cache: Servicio de caché para almacenamiento de alto rendimiento",
          "Firebase Realtime Database: Base de datos de sincronización en tiempo real",
          "Firebase Firestore: Base de datos de documentos y colecciones",
          "Firebase Analytics: Rastrea el compromiso de usuarios y eventos en tu app",
        ],
        answer: [
          "Firestore: Base de datos NoSQL en la nube para almacenar y sincronizar datos",
          "Authentication: Gestión de inicio de sesión e identidad de usuario",
          "Firebase Realtime Database: Base de datos de sincronización en tiempo real",
          "Firebase Hosting: Alojamiento web para desplegar contenido estático",
          "Firebase Functions: Backend sin servidor para ejecutar código",
          "Firebase Storage: Almacenamiento de archivos para contenido generado por usuarios",
          "Firebase Analytics: Rastrea el compromiso de usuarios y eventos en tu app",
          "Firebase Firestore: Base de datos de documentos y colecciones",
          "Firebase Machine Learning: Herramientas de ML para características de la app",
        ],
      },
    },
    {
      group: "5",
      title: "Actualizar un Proyecto con Github",
      description: "Actualiza tu versión de código haciendo pull con Github.",
      isSingleLineText: true,
      question: {
        questionText:
          "Usa el terminal para actualizar tu proyecto local de Github con la última versión disponible en Github.",
      },
    },
    {
      group: "5",
      title: "Autenticando Usuarios",
      description:
        "Instala Firebase y react-firebaseui para crear usuarios en tu aplicación.",
      isMultipleChoice: true,
      question: {
        questionText:
          "¿Qué paquete utilizas para gestionar la experiencia del usuario para la autenticación con Firebase?",
        options: [
          "firebase",
          "firebase-auth",
          "firebase-hooks",
          "react-firebaseui",
          "firebase-admin",
          "firebase-functions",
          "firebase-storage",
          "firebase-database",
        ],
        answer: "react-firebaseui",
      },
    },
    {
      group: "5",
      title: "Habilitar Inicio de Sesión con Google",
      description:
        "Habilita el método de inicio de sesión con Google en la configuración de autenticación de Firebase.",
      isText: true,
      question: {
        questionText:
          "¿Qué pasos sigues para habilitar el inicio de sesión con Google en la configuración de autenticación de Firebase?",
      },
    },
    {
      group: "5",
      title: "Conectar Firebase a Tu Código",
      description:
        "Recupera las claves de configuración de Firebase y conéctalas a tu código.",
      isCode: true,
      question: {
        questionText:
          "Escribe el código para inicializar Firebase en tu proyecto utilizando las claves de configuración.",
      },
    },
    {
      group: "5",
      title:
        "Renderizando Botón de Inicio de Sesión en React con Firebase y react-firebaseui",
      description:
        "En este paso, renderizarás un botón de inicio de sesión en tu aplicación de React usando Firebase Authentication y la biblioteca react-firebaseui.",
      isCode: true,
      question: {
        questionText:
          "Escribe el código para renderizar un botón de inicio de sesión de Firebase en un componente de React utilizando Firebase Authentication y react-firebaseui.",
      },
    },
    {
      group: "5",
      title: "Mostrando Datos de Usuario",
      description:
        "Utiliza useEffect para mostrar los datos de usuario cuando inician sesión.",
      isCode: true,
      question: {
        questionText:
          "Escribe el código para mostrar los datos del usuario utilizando el hook useEffect cuando inician sesión con Firebase.",
      },
    },
    {
      group: "5",
      title: "Actualizando el Perfil de Usuario",
      description:
        "Actualiza la información del perfil de usuario en tu base de datos de Firebase después de que hayan iniciado sesión.",
      isCode: true,
      question: {
        questionText:
          "Escribe el código para actualizar la información del perfil de usuario en Firebase Firestore.",
      },
    },
    {
      group: "5",
      title: "Actualizando un Proyecto de Github",
      description:
        "Encadenando comandos de git para actualizar un proyecto en Github.",
      isSingleLineText: true,
      question: {
        questionText:
          "Introduce la combinación de comandos de github para escribir y actualizar una base de código con un mensaje.",
        answer:
          'git add . && git commit -m "your_message" && git push origin main',
      },
    },
    {
      group: "5",
      title: "Usando Comandos de GitHub",
      description:
        "Aprende los comandos básicos de GitHub para gestionar tu código.",
      isSelectOrder: true,
      question: {
        questionText:
          "Organiza los siguientes comandos de Git en el orden correcto para programáticamente crear un nuevo repositorio y hacer push a tu cuenta de GitHub:",
        options: [
          "git init",
          "git add .",
          "git commit -m 'Initial commit'",
          "git remote add origin <repository-url>",
          "git branch -M main",
          "git push -u origin main",
        ],
        answer: [
          "git init",
          "git add .",
          "git commit -m 'Initial commit'",
          "git remote add origin <repository-url>",
          "git branch -M main",
          "git push -u origin main",
        ],
      },
    },
    {
      group: "5",
      title: "Revisión con Conversación AI (opcional)",
      isConversationReview: true,
      description: "Revisa los temas que has respondido",
      question: {
        questionText:
          "Vamos a conversar sobre las preguntas que hemos trabajado hasta ahora.",
        range: [91, 110],
      },
    },
  ],

  "maya-en": [
    {
      group: "introduction",
      title: "Maya History Overview",
      description: "When did the Classic period of Maya history begin?",
      isMultipleChoice: true,
      question: {
        questionText:
          "Which region is most closely associated with the ancient Maya?",
        options: [
          "Andes Mountains",
          "Mesoamerica",
          "Sahara Desert",
          "Mesopotamia",
        ],
        answer: ["Mesoamerica"],
      },
    },
    {
      group: "language",
      title: "Maya Writing",
      description: "Recognize the nature of Maya script.",
      isMultipleChoice: true,
      question: {
        questionText: "The Maya writing system is best described as:",
        options: [
          "Alphabetic",
          "Hieroglyphic",
          "Numeric",
          "Phoenician",
        ],
        answer: ["Hieroglyphic"],
      },
    },
  ],

  "civics-en": [
    {
      group: "introduction",
      title: "U.S. Civics Basics",
      description: "Prepare for the U.S. citizenship civics test.",
      isMultipleChoice: true,
      question: {
        questionText: "What is the supreme law of the land?",
        options: [
          "The President",
          "The Constitution",
          "Congress",
          "The States",
        ],
        answer: ["The Constitution"],
      },
    },
    {
      group: "government",
      title: "Branches of Government",
      description: "Identify a branch of the U.S. government.",
      isMultipleChoice: true,
      question: {
        questionText: "Which of the following is one branch of the U.S. government?",
        options: [
          "Economic",
          "Legislative",
          "Technological",
          "Educational",
        ],
        answer: ["Legislative"],
      },
    },
  ],

  "py-en": [
    {
      group: "introduction",
      title: "Introduction To Python Development",
      isStudyGuide: true,
      description:
        "Expose yourself to Python fundamentals to improve the quality of your learning before making progress.",

      question: {
        questionText: (
          <div>
            <p style={{ marginBottom: 12 }}>
              One of the best predictors for student success is exposure to
              course material before studying it. You're encouraged to read
              about the fundamentals of Python in this study guide before
              starting. You can reference this guide in the menu throughout your
              progress, too.
            </p>
            <p style={{ marginBottom: 12 }}>
              Remember to fail faster and fail forward! The real education
              happens when you push through a challenge. We'll start off nice
              and easy at first, then level up in difficulty as you collect more
              progress. Make sure to use the tools at your disposal—you’re going
              to need them.
            </p>
          </div>
        ),
        metaData: `### Advice
I know this looks like ChatGPT content…but it's not—it's me!

As a beginner, remember:
1. Programming is mostly about organizing information rather than complex math. Code uses logic and control flow instead of algebraic equations.
2. Like natural languages, you can express the same idea in many ways.
3. When something challenges you, fail faster and break the problem into smaller, understandable steps.

### Exposure
This guide exposes you to concepts before you answer questions, so you aren’t intimidated later. Don’t worry if you don’t grasp everything—skim it, then dive in.

### Core Concepts in Python

\`\`\`py
# Lists vs constructors
my_list = [1, 2, 3, 'a', 'b', 'c', None, False]
my_list.append('new data')

# Dictionaries (key/value objects)
data_set = {
    "introduction": "Welcome",
    "title": "Chapter 1",
    "is_live": True
}
data_set["page"] = 4
data_set["book"] = "Coding Basics"
\`\`\`

\`\`\`py
# Custom classes
class House:
    def __init__(self, paint=None):
        self.house_paint = paint

    def get_paint(self):
        return self.house_paint

    def set_paint(self, paint):
        self.house_paint = paint

    def delete_paint(self):
        self.house_paint = None
\`\`\`

### Data Analysis with pandas

\`\`\`py
import pandas as pd

# Create a DataFrame
df = pd.DataFrame({
    "house_paint": ["pink", "blue", "green"],
    "rooms": [3, 4, 2]
})

# Inspect your data
print(df.head())      # first rows
print(df.describe())  # summary statistics

# Filter and group
filtered = df[df["rooms"] >= 3]
grouped = df.groupby("house_paint").rooms.mean()
\`\`\`

### Conclusion
Failing fast is in your best interest when learning a new language. This one-pager will be available inside the app. Good luck, and happy coding!
`,
      },
    },

    {
      group: "tutorial",
      title: "Understanding Coding",
      description: "Grasp the basic concept of coding in Python.",
      isMultipleChoice: true,
      question: {
        questionText: "Which of the following best describes coding?",
        options: [
          "Writing instructions for computers to perform tasks",
          "Creating physical components for computers",
          "Designing user interfaces",
          "Managing databases",
        ],
        answer: "Writing instructions for computers to perform tasks",
      },
    },
    {
      group: "tutorial",
      title: "Sequence of Program Execution",
      description: "Learn the correct order of program execution.",
      isSelectOrder: true,
      question: {
        questionText:
          "Arrange the steps with drag-and-drop to order how a Python program executes.",
        options: [
          "Writing Code",
          "Code Interpretation",
          "Debugging",
          "Program Execution",
        ],
        answer: [
          "Writing Code",
          "Code Interpretation",
          "Debugging",
          "Program Execution",
        ],
      },
    },
    {
      group: "tutorial",
      title: "Introduction to Variables",
      description:
        "In this step, you will learn about variables and how to use them in your code.",
      isMultipleAnswerChoice: true,
      question: {
        questionText:
          "Select all the steps involved in correctly declaring a variable in Python:",
        options: [
          "Choose a descriptive variable name",
          "Start the name with a letter or underscore",
          "Assign a value using the equals sign (=)",
          "End the name with a semicolon (;)",
          "Use uppercase letters for all variable names",
          "Include type annotations for static typing",
        ],
        answer: [
          "Choose a descriptive variable name",
          "Start the name with a letter or underscore",
          "Assign a value using the equals sign (=)",
        ],
      },
    },
    {
      group: "tutorial",
      title: "Understanding List Declarations",
      description:
        "Complete the code by selecting the correct way to declare a list of items in Python.",
      isCodeCompletion: true,
      question: {
        questionText:
          "Which code block correctly declares a list of items in Python?",
        options: [
          `items = ['apple', 'banana', 'cherry']`,
          `items = {'apple': 1, 'banana': 2, 'cherry': 3}`,
          `def items():\n    return 'apple, banana, cherry'`,
          `items = 'apple, banana, cherry'`,
          `class Items:\n    pass`,
        ],
        answer: `items = ['apple', 'banana', 'cherry']`,
      },
    },
    {
      group: "tutorial",
      title: "Variable Assignment in Python",
      description: "Learn how to assign values to variables in Python.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Declare a variable named `age` and assign it the value 25.",
      },
    },
    {
      group: "tutorial",
      title: "Understanding Data Types",
      description: "Learn the basics of data types in Python.",
      isSingleLineText: true,
      question: {
        questionText:
          "By convention, how should you name a constant in Python?",
        placeholder: "Type your answer here...",
        answer: "UPPERCASE_WITH_UNDERSCORES",
      },
    },
    {
      group: "tutorial",
      title: "Purpose of Variables",
      description: "Understand why variables are used in programming.",
      isText: true,
      question: {
        questionText:
          "In your own words, explain the purpose of variables in programming.",
      },
    },
    {
      group: "tutorial",
      title: "Bash Terminal Practice: Changing Directories",
      description: "Practice changing directories in a terminal environment.",
      isCode: true,
      isTerminal: true,
      question: {
        questionText:
          "Enter the command to change to the `new_folder` directory using a Bash terminal.",
      },
    },
    {
      group: "tutorial",
      title: "Review With AI Conversation (optional)",
      isConversationReview: true,
      description: "Review the subjects you've answered",
      question: {
        questionText: "Let's chat about the questions we've worked on so far.",
        range: [1, 8],
      },
    },
    // 1
    {
      group: "1",
      title: "Data Types in Programming",
      description: "Identify different primitive data types used in Python.",
      isMultipleAnswerChoice: true,
      question: {
        questionText:
          "Which of the following are primitive data types in Python?",
        options: [
          "str",
          "int",
          "float",
          "bool",
          "NoneType",
          "list",
          "dict",
          "complex",
        ],
        answer: ["str", "int", "float", "bool", "NoneType", "complex"],
      },
    },
    // 2
    {
      group: "1",
      title: "Steps to Create a Function",
      description: "Understand the sequence of creating and using a function.",
      isSelectOrder: true,
      question: {
        questionText:
          "Arrange the steps with drag-and-drop to create and use a Python function.",
        options: [
          "Define the function",
          "Call the function",
          "Execute the function body",
          "Return a value",
        ],
        answer: [
          "Define the function",
          "Call the function",
          "Execute the function body",
          "Return a value",
        ],
      },
    },
    // 3
    {
      group: "1",
      title: "Writing a Simple Function",
      description: "Practice writing functions in Python.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Write a function named `greet` that takes a name as a parameter and prints a greeting with that name.",
      },
    },
    // 4
    {
      group: "1",
      title: "Functions in Programming",
      description: "Discuss the role of functions.",
      isText: true,
      question: {
        questionText:
          "What is a function, and why is it useful in programming?",
      },
    },
    // 5
    {
      group: "1",
      title: "Conditional Statements",
      description: "Identify the purpose of conditional statements.",
      isMultipleChoice: true,
      question: {
        questionText: "What is the primary purpose of an `if` statement?",
        options: [
          "To repeat a block of code multiple times",
          "To execute a block of code based on a condition",
          "To define a variable",
          "To import external libraries",
        ],
        answer: "To execute a block of code based on a condition",
      },
    },
    // 6
    {
      group: "1",
      title: "Order of Conditional Checks",
      description:
        "Complete the code that evaluates an `if`/`elif`/`else` statement.",
      isCodeCompletion: true,
      question: {
        questionText:
          "Complete the following code to correctly implement an `if`/`elif`/`else` statement that checks if `x` is greater than 10, equal to 10, or less than 10.",
        options: [
          `if x > 10:\n    print("x is greater than 10")\nelif x == 10:\n    print("x is equal to 10")\nelse:\n    print("x is less than 10")`,
          `if x == 10:\n    print("x is equal to 10")\nelif x > 10:\n    print("x is greater than 10")`,
          `if x > 10:\n    print("x is greater than 10")\nelse:\n    print("x is not greater than 10")`,
          `if x >= 10:\n    print("x is greater than or equal to 10")\nelse:\n    print("x is less than 10")`,
        ],
        answer: `if x > 10:\n    print("x is greater than 10")\nelif x == 10:\n    print("x is equal to 10")\nelse:\n    print("x is less than 10")`,
      },
    },
    // 7
    {
      group: "1",
      title: "Implementing Conditional Logic",
      description: "Apply conditional logic in code.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Write an `if`/`elif`/`else` statement that checks if a number `num` is positive, negative, or zero, and prints an appropriate message.",
      },
    },
    // 8
    {
      group: "1",
      title: "Understanding Conditional Logic in Programming",
      description:
        "Learn how logical operators like AND and OR control conditions in programming.",
      isSingleLineText: true,
      question: {
        questionText:
          "Which logical operator is used to check if both conditions in a conditional statement are true in Python?",
        placeholder: "Type your answer here...",
        answer: "and",
      },
    },
    // 9
    {
      group: "1",
      title: "Real-world Use of Conditionals",
      description: "Reflect on how conditionals are used.",
      isText: true,
      question: {
        questionText:
          "Provide an example of how conditional statements are used in real-world applications.",
      },
    },
    // 10
    {
      group: "1",
      title: "Terminal Practice: Help Command",
      description: "Write the help command to observe basic commands.",
      isCode: true,
      isTerminal: true,
      question: {
        questionText:
          "In a Bash terminal environment, enter the help command to discover basic commands.",
      },
    },
    // 11
    {
      group: "1",
      title: "Loops in Programming",
      description: "Understand the purpose of loops.",
      isMultipleChoice: true,
      question: {
        questionText:
          "Which loop will continue executing as long as its condition remains true in Python?",
        options: ["for loop", "while loop", "do...while loop", "foreach loop"],
        answer: "while loop",
      },
    },
    // 12
    {
      group: "1",
      title: "Sequence of Loop Execution",
      description: "Grasp the order in which loops execute.",
      isSelectOrder: true,
      question: {
        questionText:
          "Arrange the steps of a Python `for` loop execution with drag-and-drop.",
        options: [
          "Initialize iterator",
          "Check condition",
          "Execute code block",
          "Advance iterator",
        ],
        answer: [
          "Initialize iterator",
          "Check condition",
          "Execute code block",
          "Advance iterator",
        ],
      },
    },
    // 13
    {
      group: "1",
      title: "Creating a Loop",
      description: "Practice writing loops.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Write a `for` loop that prints numbers from 1 to 5 in Python.",
      },
    },
    // 14
    {
      group: "1",
      title: "Applications of Loops",
      description: "Discuss where loops are useful.",
      isText: true,
      question: {
        questionText:
          "Describe a scenario in software development where loops are essential.",
      },
    },
    // 15
    {
      group: "1",
      title: "Lists in Python",
      description: "Identify methods used for manipulating lists in Python.",
      isMultipleAnswerChoice: true,
      question: {
        questionText:
          "Which of the following methods are valid for manipulating lists in Python?",
        options: [
          ".append()",
          ".pop()",
          ".remove()",
          ".extend()",
          ".sort()",
          ".reverse()",
          ".map()", // map is a built-in function, not a list method
          ".join()", // join is a string method
        ],
        answer: [
          ".append()",
          ".pop()",
          ".remove()",
          ".extend()",
          ".sort()",
          ".reverse()",
        ],
      },
    },
    // 16
    {
      group: "1",
      title: "Order of List Operations",
      description: "Understand how list operations are performed.",
      isCodeCompletion: true,
      question: {
        questionText:
          "Complete the code to declare a list, add an element to it, remove the last element, and then access an element.",
        options: [
          `fruits = ['apple', 'banana']\nfruits.append('pink')\nfruits.pop()\nprint(fruits[0])`,
          `fruits = 'apple, banana'\nfruits.append('pink')\nfruits.pop()\nprint(fruits[0])`,
          `fruits = {'apple':1, 'banana':2}\nfruits.append('pink')\nfruits.pop()\nprint(list(fruits)[0])`,
        ],
        answer: `fruits = ['apple', 'banana']\nfruits.append('pink')\nfruits.pop()\nprint(fruits[0])`,
      },
    },
    // 17
    {
      group: "1",
      title: "Manipulating Lists",
      description: "Apply list methods in code.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Create a list `fruits` with 'apple' and 'banana'. Add 'pink' to the end and remove 'apple' from the beginning.",
      },
    },
    // 18
    {
      group: "1",
      title: "Use Cases for Lists",
      description: "Explore scenarios where lists are used.",
      isText: true,
      question: {
        questionText:
          "Provide an example of how a list can be used to manage data in a Python application.",
      },
    },
    // 19
    {
      group: "1",
      title: "Terminal Practice: Creating Directories",
      description: "Creating a directory command in a bash terminal",
      isCode: true,
      isTerminal: true,
      question: {
        questionText:
          "In a Bash terminal environment, create a directory called `app` using the mkdir command.",
      },
    },
    // 20
    {
      group: "1",
      title: "Advanced Coding Output",
      description:
        "Predict the output of the following code with lists, conditionals, logical operators, and list comprehensions.",
      isSingleLineText: true,
      question: {
        questionText: (
          <div>
            What will be the output of the following code?
            <br />
            <pre>
              {`
arr = [1, 2, 3, 4]
x = 10
y = 5

if x > y and len(arr) > 3:
    arr.append(x)
    arr = [n for n in arr if n % 2 == 0]

print(arr)
`}
            </pre>
          </div>
        ),
        placeholder: "Type your answer here...",
        answer: "[2, 4, 10]",
      },
    },
    // 21
    {
      group: "1",
      title: "Review With AI Conversation (optional)",
      isConversationReview: true,
      description: "Review the subjects you've answered",
      question: {
        questionText: "Let's chat about the questions we've worked on so far.",
        range: [10, 29], // Indices of steps to review
      },
    },
    // 1
    {
      group: "2",
      title: "Introduction to Objects",
      description:
        "In this step, you will learn what an object is in programming.",
      isSingleLineText: true,
      question: {
        questionText:
          "In programming, which keyword creates a new object instance in Python?",
        placeholder: "Type your answer here...",
        answer:
          "None (Python uses class instantiation without a specific keyword)",
      },
    },
    // 2
    {
      group: "2",
      title: "Understanding the __init__ Method",
      description:
        "In this step, you will learn about the purpose of the `__init__` method in a Python class.",
      isCodeCompletion: true,
      question: {
        questionText:
          "Which of the following code blocks correctly defines the `__init__` method for class instantiation in Python?",
        options: [
          `class Car:\n    def __init__(self, brand):\n        self.brand = brand\n\nmy_car = Car("Toyota")`,
          `class Car:\n    def init(self, brand):\n        self.brand = brand\n\nmy_car = Car("Toyota")`,
          `class Car:\n    def __init__(brand):\n        self.brand = brand\n\nmy_car = Car("Toyota")`,
          `class Car:\n    def __init__(self, brand):\n        brand = self.brand\n\nmy_car = Car("Toyota")`,
        ],
        answer: `class Car:\n    def __init__(self, brand):\n        self.brand = brand\n\nmy_car = Car("Toyota")`,
      },
    },
    // 3
    {
      group: "2",
      title: "Purpose of the __init__ Method",
      description:
        "In this step, you will learn about the purpose of the `__init__` method in a class.",
      isText: true,
      question: {
        questionText:
          "Explain the purpose of the `__init__` method in a Python class.",
      },
    },
    // 4
    {
      group: "2",
      title: "Creating an Instance of a Class",
      description:
        "In this step, you will learn how to create an instance of a class in Python.",
      isMultipleAnswerChoice: true,
      question: {
        questionText:
          "Select all correct steps required to create an instance of a class in Python:",
        options: [
          `Define class using class keyword`,
          `Call constructor with parentheses`,
          `Pass required arguments to constructor`,
          `Store returned instance in a variable`,
          `Use new keyword`,
          `Define class with function keyword`,
          `Call class directly without parentheses`,
        ],
        answer: [
          `Define class using class keyword`,
          `Call constructor with parentheses`,
          `Pass required arguments to constructor`,
          `Store returned instance in a variable`,
        ],
      },
    },
    // 5
    {
      group: "2",
      title: "Declaring a Method in a Class",
      description:
        "In this step, you will learn how to declare a method inside a class.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Declare a method named `update_model` in the `Car` class that updates the `model` attribute.",
      },
    },
    // 6
    {
      group: "2",
      title: "Using self",
      description:
        "Complete the code by selecting the correct way to use `self` to refer to the instance property.",
      isCodeCompletion: true,
      question: {
        questionText:
          "Which code block correctly uses `self` to refer to the object's property?",
        options: [
          `class Car:\n    def __init__(self, brand):\n        self.brand = brand\n\n    def show_brand(self):\n        print(brand)`,
          `class Car:\n    def __init__(self, brand):\n        self.brand = brand\n\n    def show_brand(self):\n        print(self.brand)`,
          `class Car:\n    def __init__(self, brand):\n        brand = self.brand\n\n    def show_brand(self):\n        print(brand)`,
          `class Car:\n    def __init__(self, brand):\n        self.brand = brand\n\n    def show_brand(self):\n        print(self.brand())`,
        ],
        answer: `class Car:\n    def __init__(self, brand):\n        self.brand = brand\n\n    def show_brand(self):\n        print(self.brand)`,
      },
    },
    // 7
    {
      group: "2",
      title: "Adding Attributes to an Object",
      description:
        "In this step, you will learn how to add attributes to a Python class.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText: "Add a new attribute `year` to the `Car` class.",
      },
    },
    // 8
    {
      group: "2",
      title: "Accessing and Modifying Attributes",
      description:
        "In this step, you will learn how to get or set attributes of an object.",
      isMultipleAnswerChoice: true,
      question: {
        questionText:
          "Which of the following are valid ways to get or set properties in Python?",
        options: [
          `Use dot notation (e.g., obj.property)`,
          `Use getattr(obj, 'property')`,
          `Use setter method if defined`,
          `Use obj['property']`,
          `Call obj.property() without defining method`,
        ],
        answer: [
          `Use dot notation (e.g., obj.property)`,
          `Use getattr(obj, 'property')`,
          `Use setter method if defined`,
        ],
      },
    },
    // 9
    {
      group: "2",
      title: "Modifying Object Attributes",
      description:
        "In this step, you will learn how to modify attributes of an object.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Modify the `model` attribute of an instance of the `Car` class.",
      },
    },
    // 10
    {
      group: "2",
      title: "Understanding Inheritance",
      description:
        "In this step, you will learn about inheritance in object-oriented programming.",
      isText: true,
      question: {
        questionText: "What is inheritance in object-oriented programming?",
      },
    },
    // 11
    {
      group: "2",
      title: "Implementing Inheritance",
      description:
        "In this step, you will implement inheritance in Python by subclassing.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Extend the `Car` class to create an `ElectricCar` class with an additional attribute `battery_life`.",
      },
    },
    // 12
    {
      group: "2",
      title: "Overriding Methods",
      description:
        "In this step, you will learn how to override methods in a subclass.",
      isMultipleChoice: true,
      question: {
        questionText: "What does it mean to override a method in a subclass?",
        options: [
          `Replace superclass method with new implementation`,
          `Delete method from superclass`,
          `Inherit method without changes`,
          `Call method from a different class`,
          `Extend method functionality via super()`,
        ],
        answer: [
          `Replace superclass method with new implementation`,
          `Extend method functionality via super()`,
        ],
      },
    },
    // 13
    {
      group: "2",
      title: "Understanding Encapsulation",
      description:
        "In this step, you will learn about encapsulation in object-oriented programming.",
      isText: true,
      question: {
        questionText: "What is encapsulation in object-oriented programming?",
      },
    },
    // 14
    {
      group: "2",
      title: "Implementing Encapsulation",
      description:
        "In this step, you will implement encapsulation by using getter and setter methods.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Add getter and setter methods for the `battery_life` attribute in the `ElectricCar` class.",
      },
    },
    // 15
    {
      group: "2",
      title: "Encapsulation Concept",
      description:
        "In this step, you will define the core concept of encapsulation in one word.",
      isSingleLineText: true,
      question: {
        questionText:
          "What is the primary concept encapsulation ensures in object-oriented programming?",
        placeholder: "Type your answer here...",
        answer: "Abstraction",
      },
    },
    // 16
    {
      group: "2",
      title: "Combining Concepts",
      description:
        "In this step, you will combine various concepts learned to create a small project.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Create a small project that defines a `Person` class, uses inheritance to create a `Student` subclass, and demonstrates encapsulation and lists of objects.",
      },
    },
    // 17
    {
      group: "2",
      title: "Printing in the Terminal",
      description: "In this step, you will print a message using the terminal",
      isCode: true,
      isTerminal: true,
      question: {
        questionText:
          "Type a command to print: 'I'm talking to the inside of a computer!'",
      },
    },
    // 18
    {
      group: "2",
      title: "Review With AI Conversation (optional)",
      isConversationReview: true,
      description: "Review the subjects you've answered",
      question: {
        questionText: "Let's chat about the questions we've worked on so far.",
        range: [31, 47],
      },
    },

    {
      group: "3",
      title: "Introduction to React Components",
      description:
        "In this step, you will learn about React components, their role in creating reusable UI elements, and how they help manage the user interface efficiently.",
      isMultipleChoice: true,
      question: {
        questionText:
          "Which of the following best describes a React component?",
        options: [
          "A method for handling events in JavaScript",
          "A feature exclusive to server-side rendering in React",
          "A reusable piece of user interface defined as a function or class that returns JSX",
          "A built-in HTML element in React",
        ],
        answer:
          "A reusable piece of user interface defined as a function or class that returns JSX",
      },
    },
    {
      group: "3",
      title: "Key Concepts in React",
      description:
        "In this step, you will learn about the fundamental concepts of React, including properties (props), state, events, and styles.",
      isMultipleAnswerChoice: true,
      question: {
        questionText: "Which of the following are key concepts in React?",
        options: [
          "Managing properties to pass data between components",
          "Manipulating the DOM directly for better performance",
          "Using state to manage data within a component",
          "Handling events such as clicks with event handlers",
          "Applying inline styles or CSS classes to components",
        ],
        answer: [
          "Managing properties to pass data between components",
          "Using state to manage data within a component",
          "Handling events such as clicks with event handlers",
          "Applying inline styles or CSS classes to components",
        ],
      },
    },
    {
      group: "3",
      title: "Effect of State Changes on a Component",
      description:
        "In this step, you will explain what happens to a React component when its state changes.",
      isText: true,
      question: {
        questionText:
          "What happens to a React component when its state changes?",
      },
    },

    //next lecture
    {
      group: "3",
      title: "Creating a Simple React Component",
      description:
        "In this step, you will define a basic React component that returns some simple JSX.",
      isCodeCompletion: true,
      question: {
        questionText:
          "Which of the following code blocks correctly defines a simple React component that returns a heading and a paragraph?",
        options: [
          // Option 1: Correct answer
          `function MyComponent() {
  return (
    <div>
      <h1>Hello, World!</h1>
      <p>Welcome to the thunderdome</p>
    </div>
  );
}`,

          // Option 2: Incorrect - missing return statement
          `function MyComponent() {
  <div>
    <h1>Hello, World!</h1>
    <p>Welcome to the thunderdome</p>
  </div>;
}`,

          // Option 3: Incorrect - uses class instead of function
          `class MyComponent {
  render() {
    return (
      <div>
        <h1>Hello, World!</h1>
        <p>How are we today?</p>
      </div>
    );
  }
}`,

          // Option 4: Incorrect - missing JSX inside the return
          `function MyComponent() {
  return (
    <div>Hello World</div>
    <p>How are we today?</p>
  );
}`,
        ],
        answer: `function MyComponent() {
  return (
    <div>
      <h1>Hello, World!</h1>
      <p>Welcome to the thunderdome</p>
    </div>
  );
}`,
      },
    },
    {
      group: "3",
      title: "Handling Events in React",
      description:
        "In this step, you will define a basic React component that handles a button click event using the `onClick` attribute.",
      isCodeCompletion: true,
      question: {
        questionText:
          "Which of the following code blocks correctly defines a React component that handles a button click event?",
        options: [
          // Option 2: Incorrect - no event handler function defined
          `function MyComponent() {
  return (
    <div>
      <button 
        onClick={
          alert('Button clicked!')
        }
      >
        Click me
      </button>
    </div>
  );
}`,

          // Option 3: Incorrect - inline event handler, not recommended
          `function MyComponent() {
return (
  <div>
    <button 
      onClick= () => {
        alert('Button clicked!')
      }
    >
      Click me
    </button>
  </div>
);
}`,
          `function MyComponent() {
  const handleClick = () => {
    alert('Button clicked!');
  };
    
  return (
    <div>
      <button 
        onClick={handleClick}
      >
        Click me
      </button>
    </div>
  );
}`,

          // Option 4: Incorrect - no onClick attribute
          `function MyComponent() {
return (
  <div>
    <button>
      Click me
    </button>
  </div>
);
    }`,
        ],
        answer: `function MyComponent() {
  const handleClick = () => {
    alert('Button clicked!');
  };

  return (
    <div>
      <button 
        onClick={handleClick}
      >
        Click me
      </button>
    </div>
  );
}`,
      },
    },

    {
      group: "3",
      title: "Managing State with useState Hook",
      description:
        "In this step, you will learn how to use the useState hook to manage the state of a component.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText: `Modify the Tweet component to include a like button that toggles the liked state using the useState hook.`,
      },
    },

    //next lecture
    {
      group: "3",
      title: "Component Properties",
      description:
        "In this step, you will learn about passing properties to components in React.",
      isSingleLineText: true,
      question: {
        questionText:
          "What is the term used for passing data to a React component?",
        placeholder: "Type your answer here...",
        answer: "props",
      },
    },
    {
      group: "3",
      title: "Passing and Using Props",
      description:
        "In this step, you will learn how to pass and use props in a React component.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Update the Tweet component to accept and display the user's name, handle, and tweet content as props.",
      },
    },
    {
      group: "3",
      title: "Working with Props and State Together",
      description:
        "In this step, you will learn how to work with both props and state in a React component.",
      isMultipleChoice: true,
      question: {
        questionText:
          "What is the main difference between props and state in React?",
        options: [
          "Props are immutable while state is mutable",
          "Props are managed by the component itself while state is passed down from parent components",
          "State is used for styling while props are used for logic",
          "There is no difference; they are the same",
        ],
        answer: "Props are immutable while state is mutable",
      },
    },

    //next lecture
    {
      group: "3",
      title: "Terminal Practice: Listing Files",
      description:
        "In this step, you will learn how to list files in a bash terminal.",
      isCode: true,
      isTerminal: true,
      question: {
        questionText: `Use the terminal to list all the files using the list command.`,
      },
    },

    {
      group: "3",
      title: "Styling React Components",
      description:
        "In this step, you will learn how to style React components using CSS.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText: `Add styles to the Tweet component to improve its appearance.`,
      },
    },
    {
      group: "3",
      title: "Using Flexbox for Layouts",
      description:
        "In this step, you will learn how to use Flexbox to create layouts in React.",
      isSelectOrder: true,
      question: {
        questionText:
          "Arrange the following CSS properties in the order needed to center a basic layout with flexbox styling:",
        options: [
          "display: flex;",
          "justify-content: center;",
          "align-items: center;",
          "flex-direction: row;",
        ],
        answer: [
          "display: flex;",
          "flex-direction: row;",
          "justify-content: center;",
          "align-items: center;",
        ],
      },
    },

    //next lecture
    {
      group: "3",
      title: "Lifting State Up",
      description:
        "In this step, you will learn how to lift state up to a common ancestor component to share state between components.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText: `Create a parent component that manages the state for multiple Tweet components and passes the state and event handlers as props.`,
      },
    },
    {
      group: "3",
      title: "Using useEffect for Side Effects",
      description:
        "In this step, you will learn how to use the useEffect hook to handle side effects in a React component.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Modify the Tweet component to use the useEffect hook to log a message to the console every time the number of retweets changes.",
      },
    },

    {
      group: "3",
      title: "Understanding Component Lifecycle",
      description:
        "In this step, you will learn about the lifecycle of React components and how to use useEffect hook to manage side effects.",
      isText: true,
      question: {
        questionText:
          "What is the component lifecycle in React and what is the purpose of the useEffect hook?",
      },
    },

    //next
    {
      group: "3",
      title: "Fetching Data with useEffect",
      description:
        "In this step, you will learn how to fetch data from an API using the useEffect hook.",
      isSelectOrder: true,
      question: {
        questionText:
          "Arrange the steps with drag-and-drop to correctly fetch data using useEffect.",
        options: [
          "Import React and useState",
          "Import useEffect from React",
          "Create a component",
          "Define the useEffect hook",
          "Make the API call inside useEffect",
          "Use async/await or .then() to handle the API response",
          "Update the component state with the fetched data",
          "Handle errors in the API call",
          "Render the data in the component",
        ],
        answer: [
          "Import React and useState",
          "Import useEffect from React",
          "Create a component",
          "Define the useEffect hook",
          "Make the API call inside useEffect",
          "Use async/await or .then() to handle the API response",
          "Update the component state with the fetched data",
          "Handle errors in the API call",
          "Render the data in the component",
        ],
      },
    },

    {
      group: "3",
      title: "Building a Complete Tweet App",
      description:
        "In this step, you will combine everything you have learned to build a complete Tweet app.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText: `Build a complete Tweet app that fetches tweets from an API, displays them using the Tweet component, and allows users to like and retweet.`,
      },
    },
    {
      group: "3",
      title: "Terminal Practice: Setting Up A React App",
      description: "In this step, you will learn how to set up a react project",

      isText: true,
      question: {
        questionText:
          "Enter the command to install the latest version of a react project with vite.",
      },
    },

    //next
    {
      group: "3",
      title: "Creating a New React Project with Vite",
      description:
        "In this step, you will learn how to create a new React project using Vite by following the correct steps and running command-line commands.",
      isSelectOrder: true,
      question: {
        questionText:
          "Arrange the steps with drag-and-drop to correctly create a new React project using Vite, including command-line commands.",
        options: [
          "Ensure Node.js, NPM and VSCode are installed",
          "Run `npm create vite@latest` to create a new Vite project",
          "Select the React template when prompted",
          "Navigate to the project directory using `cd project-name`",
          "Run `npm install` to install dependencies",
          "Start the development server with `npm run dev`",
        ],
        answer: [
          "Ensure Node.js, NPM and VSCode are installed",
          "Run `npm create vite@latest` to create a new Vite project",
          "Select the React template when prompted",
          "Navigate to the project directory using `cd project-name`",
          "Run `npm install` to install dependencies",
          "Start the development server with `npm run dev`",
        ],
      },
    },
    {
      group: "3",
      title: "Review With AI Conversation (optional)",
      isConversationReview: true,
      description: "Review the subjects you've answered",
      question: {
        questionText: "Let's chat about the questions we've worked on so far.",
        range: [49, 67], // Indices of steps to review
      },
    },
    // 1
    {
      group: "4",
      title: "Introduction to Python Backend Engineering",
      description:
        "In this step, you will learn what backend software engineering is and why it is important.",
      isText: true,
      question: {
        questionText:
          "What is backend software engineering and why is it important in building applications?",
      },
    },
    // 2
    {
      group: "4",
      title: "Main Lessons Overview",
      description:
        "In this step, you will identify a core responsibility of backend engineering in Python.",
      isMultipleChoice: true,
      question: {
        questionText:
          "Which of the following is a core responsibility in backend engineering?",
        options: [
          "Managing concurrency and ensuring thread safety in multi-user applications",
          "Implementing user authentication directly in the user interface",
          "Handling memory allocation and garbage collection in the Python interpreter",
          "Designing scalable front-end components for cross-browser compatibility",
          "Optimizing database queries and ensuring data consistency",
        ],
        answer: "Optimizing database queries and ensuring data consistency",
      },
    },
    // 3
    {
      group: "4",
      title: "Key Responsibilities of Backend Engineering",
      description:
        "In this step, you will learn about the various responsibilities involved in Python backend engineering.",
      isMultipleAnswerChoice: true,
      question: {
        questionText:
          "Which of the following are core responsibilities of backend engineering?",
        options: [
          "Managing and optimizing databases for storing and retrieving data efficiently",
          "Designing and implementing RESTful APIs to facilitate communication between systems",
          "Ensuring security through user authentication and authorization mechanisms",
          "Handling server-side logic, including business operations and calculations",
          "Maintaining server reliability and performance under high traffic",
          "Managing data integrity and consistency across distributed systems",
          "Implementing logging and monitoring to ensure system health and debug issues",
        ],
        answer: [
          "Managing and optimizing databases for storing and retrieving data efficiently",
          "Designing and implementing RESTful APIs to facilitate communication between systems",
          "Ensuring security through user authentication and authorization mechanisms",
          "Handling server-side logic, including business operations and calculations",
          "Maintaining server reliability and performance under high traffic",
          "Managing data integrity and consistency across distributed systems",
          "Implementing logging and monitoring to ensure system health and debug issues",
        ],
      },
    },
    // 4
    {
      group: "4",
      title: "Interfacing with the Terminal",
      description:
        "In this step, you will learn about using the terminal in Python backend engineering.",
      isText: true,
      question: {
        questionText:
          "Why is learning to use the terminal important for backend development, and what kinds of tasks can you perform using it?",
      },
    },
    // 5
    {
      group: "4",
      title: "Upgrading pip",
      description: "In this step, you will learn how to upgrade pip globally.",
      isText: true,
      question: {
        questionText:
          "Write the command to upgrade pip, the Python package manager, globally.",
      },
    },
    // 6
    {
      group: "4",
      title: "Installing a Python Package",
      description:
        "In this step, you will use the terminal to install a package with pip.",
      isText: true,
      question: {
        questionText:
          "Write the command to install Flask, a popular Python web framework.",
      },
    },
    // 7
    {
      group: "4",
      title: "User Creation and Authentication",
      description:
        "In this step, you will understand the key concept related to creating users in backend systems.",
      isSingleLineText: true,
      question: {
        questionText:
          "What is the process called that verifies a user's identity during account creation?",
        placeholder: "Type your answer here...",
        answer: "authentication",
      },
    },
    // 8
    {
      group: "4",
      title: "Database Foundations",
      description:
        "In this step, you will learn about the foundations of databases in backend engineering.",
      isText: true,
      question: {
        questionText:
          "What are the main types of databases used in backend engineering?",
      },
    },
    // 9
    {
      group: "4",
      title: "Connecting Systems",
      description:
        "Write a code snippet to connect a Python application to a PostgreSQL database using psycopg2.",
      isCode: true,
      question: {
        questionText:
          "Write a Python code snippet to connect an application to a PostgreSQL database.",
      },
    },
    // 10
    {
      group: "4",
      title: "Starting a Django Project",
      description:
        "In this step, you will learn how to start a Django project using the command line.",
      isSingleLineText: true,
      question: {
        questionText: "What is the command to start a new Django project?",
        answer: "django-admin startproject mysite",
      },
    },
    // 11
    {
      group: "4",
      title: "Advanced Data Storage Practices",
      description:
        "In this step, you will learn advanced practices for storing data responsibly in backend systems.",
      isMultipleAnswerChoice: true,
      question: {
        questionText:
          "Which of the following are best practices for ensuring responsible data storage in a backend system?",
        options: [
          "Cache data in memory (e.g., Redis) to reduce database access time",
          "Use a single centralized backup to reduce complexity and cost",
          "Encrypt sensitive data both at rest and in transit to ensure security",
          "Implement database replication across multiple servers to improve fault tolerance",
        ],
        answer: [
          "Cache data in memory (e.g., Redis) to reduce database access time",
          "Encrypt sensitive data both at rest and in transit to ensure security",
          "Implement database replication across multiple servers to improve fault tolerance",
        ],
      },
    },
    // 12
    {
      group: "4",
      title: "Initializing SQLAlchemy and Adding a Record",
      description:
        "In this step, you will learn how to initialize SQLAlchemy and add a record.",
      isCodeCompletion: true,
      question: {
        questionText:
          "Complete the code to initialize SQLAlchemy with a Flask app and add a new User record.",
        options: [
          // 1) Correct initialization & commit
          `from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://user:pass@localhost/db'
db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, unique=True)

# Add user
new_user = User(username='alice')
db.session.add(new_user)
db.session.commit()`,
          // 2) Forgot to call commit()
          `from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://user:pass@localhost/db'
db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, unique=True)

# Add user
new_user = User(username='alice')
db.session.add(new_user)  # forgot db.session.commit()`,
          // 3) Used create_all instead of binding to app
          `from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://user:pass@localhost/db'
db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, unique=True)

db.create_all()  # missing db.init_app(app)

# Add user
new_user = User(username='alice')
db.session.add(new_user)
db.session.commit()`,
          // 4) Incorrect URI key and missing session.add
          `from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['DATABASE_URI'] = 'postgres://user:pass@localhost/db'  # wrong config key
db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, unique=True)

# Add user
new_user = User(username='alice')
db.commit()  # wrong call: should be db.session.commit()`,
        ],
        answer: `from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://user:pass@localhost/db'
db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, unique=True)

# Add user
new_user = User(username='alice')
db.session.add(new_user)
db.session.commit()`,
      },
    },
    // 13
    {
      group: "4",
      title: "Handling User Data",
      description:
        "In this step, you will learn how to retrieve a user object using SQLAlchemy.",
      isCode: true,
      question: {
        questionText:
          "Write a Python code snippet to get a User object by ID using SQLAlchemy.",
      },
    },
    // 14
    {
      group: "4",
      title: "Retrieving a Record After Authentication",
      description:
        "In this step, you will learn how to retrieve a record after verifying credentials.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Write code to retrieve a User record from the database after authentication.",
      },
    },
    // 15
    {
      group: "4",
      title: "Understanding the Authentication Flow",
      description:
        "In this step, you will learn about the typical flow of authentication in backend systems.",
      isSelectOrder: true,
      question: {
        questionText:
          "Arrange the following steps in the correct order for a typical JWT authentication flow in a Python backend.",
        options: [
          "User submits credentials via POST",
          "Backend verifies credentials against the database",
          "JWT token is generated and signed",
          "Client stores token locally",
          "Backend validates token on protected routes",
        ],
        answer: [
          "User submits credentials via POST",
          "Backend verifies credentials against the database",
          "JWT token is generated and signed",
          "Client stores token locally",
          "Backend validates token on protected routes",
        ],
      },
    },
    // 16
    {
      group: "4",
      title: "OAuth Authentication",
      description:
        "In this step, you will learn about OAuth-style authentication systems.",
      isSingleLineText: true,
      question: {
        questionText:
          "What is the widely used protocol for authorization that allows third-party services to access user data without exposing credentials?",
        placeholder: "Type your answer here...",
        answer: "OAuth 2.0",
      },
    },
    // 17
    {
      group: "4",
      title: "Using Environment Variables",
      description:
        "In this step, you will learn about using environment variables in backend development.",
      isText: true,
      question: {
        questionText: "What role do environment variables play in a codebase?",
      },
    },
    // 18
    {
      group: "4",
      title: "Database Relationships",
      description:
        "In this step, you will learn about defining relationships in SQLAlchemy.",
      isCode: true,
      question: {
        questionText:
          "Write a code snippet to define a one-to-many relationship between User and Post models in SQLAlchemy.",
      },
    },
    // 19
    {
      group: "4",
      title: "Interfacing with an API",
      description:
        "In this step, you will learn the common HTTP methods used to interface with an API.",
      isMultipleAnswerChoice: true,
      question: {
        questionText:
          "Which of the following HTTP methods are commonly used to interface with a REST API, and what do they do?",
        options: [
          "GET (Retrieves data)",
          "POST (Creates a new resource)",
          "SEND (Sends data for processing)",
          "PATCH (Partially updates a resource)",
          "DELETE (Deletes a resource)",
        ],
        answer: [
          "GET (Retrieves data)",
          "POST (Creates a new resource)",
          "PATCH (Partially updates a resource)",
          "DELETE (Deletes a resource)",
        ],
      },
    },
    // 20
    {
      group: "4",
      title: "Creating a JWT Authentication System",
      description:
        "In this step, you will create a simple user authentication system with JWT.",
      isSelectOrder: true,
      question: {
        questionText:
          "Arrange the steps with drag-and-drop to implement JWT authentication in Python.",
        options: [
          "Install PyJWT",
          "Define User model",
          "Create register endpoint",
          "Hash passwords before storing",
          "Create login endpoint",
          "Verify user credentials",
          "Generate JWT token",
          "Return token to client",
          "Protect routes with token verification",
        ],
        answer: [
          "Install PyJWT",
          "Define User model",
          "Create register endpoint",
          "Hash passwords before storing",
          "Create login endpoint",
          "Verify user credentials",
          "Generate JWT token",
          "Return token to client",
          "Protect routes with token verification",
        ],
      },
    },
    // 21
    {
      group: "4",
      title: "Deploying a Python Application",
      description:
        "In this step, you will learn how to deploy a Python backend application.",
      isText: true,
      question: {
        questionText:
          "Write the command to start a Gunicorn server for your Flask app.",
      },
    },
    // 22
    {
      group: "4",
      title: "Review With AI Conversation (optional)",
      isConversationReview: true,
      description: "Review the subjects you've answered",
      question: {
        questionText: "Let's chat about the questions we've worked on so far.",
        range: [69, 89],
      },
    },
    // 1
    {
      group: "5",
      title: "Benefits of Serverless Cloud Platforms",
      description:
        "In this step, you will explore the advantages of using Firebase in software development.",
      isText: true,
      question: {
        questionText:
          "What are the key benefits of using Firebase as a serverless backend, and how does it differ from traditional server-based models?",
      },
    },
    // 2
    {
      group: "5",
      title: "Understanding VSCode",
      description:
        "In this step, you will explore what Visual Studio Code (VSCode) is and why it is a popular code editor for Firebase development.",
      isText: true,
      question: {
        questionText:
          "What is Visual Studio Code (VSCode) and why do many Firebase developers choose it?",
      },
    },
    // 3
    {
      group: "5",
      title: "Installing Node.js and npm",
      description:
        "Install Node.js and npm, required for the Firebase CLI and local emulation.",
      isText: true,
      question: {
        questionText:
          "What is the purpose of Node.js and npm when working with Firebase projects?",
      },
    },
    // 4
    {
      group: "5",
      title: "Installing Project Dependencies",
      description: "Install all dependencies listed in package.json.",
      isSingleLineText: true,
      question: {
        questionText:
          "Enter the command to install dependencies from package.json.",
        answer: "npm install",
      },
    },
    // 5
    {
      group: "5",
      title: "Install Firebase CLI",
      description: "Install the Firebase CLI globally using npm.",
      isSingleLineText: true,
      question: {
        questionText:
          "What command do you use to install the Firebase CLI globally?",
        answer: "npm install -g firebase-tools",
      },
    },
    // 6
    {
      group: "5",
      title: "Initializing a Firebase Project",
      description:
        "In this step, you will initialize a new Firebase project using the CLI.",
      isSingleLineText: true,
      question: {
        questionText:
          "What command do you use to initialize a Firebase project in your directory?",
        answer: "firebase init",
      },
    },
    // 7
    {
      group: "5",
      title: "Selecting Firebase Features",
      description:
        "Choose which Firebase services to configure during initialization.",
      isMultipleAnswerChoice: true,
      question: {
        questionText:
          "During `firebase init`, which of the following features might you enable?",
        options: [
          "Authentication",
          "Firestore",
          "Realtime Database",
          "Cloud Functions",
          "Hosting",
          "Storage",
          "Emulators",
        ],
        answer: ["Authentication", "Firestore", "Cloud Functions", "Hosting"],
      },
    },
    // 8
    {
      group: "5",
      title: "Configuring Firebase SDK",
      description:
        "In this step, you will set up the Firebase Admin SDK in Python.",
      isCode: true,
      question: {
        questionText:
          "Write the Python code to initialize the Firebase Admin SDK with a service account.",
      },
    },
    // 9
    {
      group: "5",
      title: "Setting Up Firestore",
      description: "Learn how to initialize Firestore in your Python code.",
      isCode: true,
      question: {
        questionText:
          "Add the code to get a Firestore client from the initialized Admin SDK.",
      },
    },
    // 10
    {
      group: "5",
      title: "Understanding Authentication",
      description:
        "In this step, you will learn about Firebase Authentication.",
      isText: true,
      question: {
        questionText:
          "What is Firebase Authentication, and what types of sign-in methods does it support?",
      },
    },
    // 11
    {
      group: "5",
      title: "Creating a User with Firebase Auth",
      description:
        "In this step, you will learn how to create a new user account programmatically.",
      isCode: true,
      question: {
        questionText:
          "Write Python code using the Admin SDK to create a new user with email and password.",
      },
    },
    // 12
    {
      group: "5",
      title: "Verifying ID Tokens",
      description:
        "Learn how to verify a client’s Firebase ID token on your backend.",
      isCode: true,
      question: {
        questionText:
          "Write Python code to verify a Firebase ID token and extract the user UID.",
      },
    },
    // 13
    {
      group: "5",
      title: "CRUD with Firestore",
      description:
        "In this step, you will perform basic database operations with Firestore.",
      isCodeCompletion: true,
      question: {
        questionText:
          "Complete the Python code to add, get, update, and delete a document in Firestore.",
        options: [
          // 1) Correct sequence of calls
          `# assume db is a Firestore client
doc_ref = db.collection('users').document('alice')
# create
doc_ref.set({'email': 'alice@example.com', 'age': 30})
# read
user = doc_ref.get().to_dict()
# update
doc_ref.update({'age': 31})
# delete
doc_ref.delete()`,

          // 2) Forgot to delete the document
          `# assume db is a Firestore client
doc_ref = db.collection('users').document('alice')
# create
doc_ref.set({'email': 'alice@example.com', 'age': 30})
# read
user = doc_ref.get().to_dict()
# update
doc_ref.update({'age': 31})
# (missing delete step)`,

          // 3) Used add() on a collection instead of document()
          `# assume db is a Firestore client
users_col = db.collection('users')
# create
new_ref = users_col.add({'email': 'alice@example.com', 'age': 30})
# read
user = new_ref.get().to_dict()
# update
new_ref.update({'age': 31})
# delete
new_ref.delete()`,

          // 4) Read without converting to dict, and wrong delete call
          `# assume db is a Firestore client
doc_ref = db.collection('users').document('alice')
# create
doc_ref.set({'email': 'alice@example.com', 'age': 30})
# read
user = doc_ref.get()             # forgot .to_dict()
# update
doc_ref.update({'age': 31})
# delete
db.collection('users').delete()   # invalid: delete on collection`,
        ],
        answer: `# assume db is a Firestore client
doc_ref = db.collection('users').document('alice')
# create
doc_ref.set({'email': 'alice@example.com', 'age': 30})
# read
user = doc_ref.get().to_dict()
# update
doc_ref.update({'age': 31})
# delete
doc_ref.delete()`,
      },
    },
    // 14
    {
      group: "5",
      title: "Writing Cloud Functions",
      description:
        "In this step, you will write a simple Firebase Cloud Function in Python.",
      isCode: true,
      question: {
        questionText:
          "Show a basic HTTP-triggered Cloud Function that returns 'Hello Firebase'.",
      },
    },
    // 15
    {
      group: "5",
      title: "Local Emulation",
      description: "Learn how to test Functions and Firestore locally.",
      isSingleLineText: true,
      question: {
        questionText: "What command starts the local Firebase emulator suite?",
        answer: "firebase emulators:start",
      },
    },
    // 16
    {
      group: "5",
      title: "Deploying to Firebase",
      description:
        "In this step, you will deploy your Functions and Firestore rules to production.",
      isSingleLineText: true,
      question: {
        questionText: "What command do you use to deploy only Cloud Functions?",
        answer: "firebase deploy --only functions",
      },
    },
    // 17
    {
      group: "5",
      title: "Storage with Firebase",
      description:
        "Learn how to upload and serve files using Firebase Storage.",
      isCode: true,
      question: {
        questionText:
          "Write Python code using the Admin SDK to upload a file to a Storage bucket.",
      },
    },
    // 18
    {
      group: "5",
      title: "Security Rules Basics",
      description:
        "In this step, you will learn about Firestore security rules.",
      isText: true,
      question: {
        questionText:
          "What are Firestore security rules and when are they evaluated?",
      },
    },
    // 19
    {
      group: "5",
      title: "Monitoring and Analytics",
      description:
        "Explore Firebase’s built-in monitoring and analytics tools.",
      isText: true,
      question: {
        questionText:
          "Which Firebase products help you monitor performance and usage of your backend?",
      },
    },
    // 20
    {
      group: "5",
      title: "Popular Firebase Extensions",
      description: "Learn about official Firebase Extensions you can install.",
      isMultipleAnswerChoice: true,
      question: {
        questionText:
          "Which of the following are Firebase Extensions provided by Google?",
        options: [
          "Trigger Email via SendGrid",
          "Resize Images",
          "Translate Text",
          "Host Static Site",
          "Backup Realtime Database",
        ],
        answer: [
          "Trigger Email via SendGrid",
          "Resize Images",
          "Translate Text",
          "Backup Realtime Database",
        ],
      },
    },
    // 21
    {
      group: "5",
      title: "Review With AI Conversation (optional)",
      isConversationReview: true,
      description: "Review the subjects you've answered",
      question: {
        questionText: "Let's chat about the questions we've worked on so far.",
        range: [91, 110],
      },
    },
  ],

  ["swift-en"]: [
    {
      group: "introduction",
      title: "Introduction To iOS Development with Swift",
      isStudyGuide: true,
      description:
        "Expose yourself to Swift fundamentals and SwiftUI basics to improve the quality of your learning before making progress.",
      question: {
        questionText: (
          <div>
            <p style={{ marginBottom: 12 }}>
              One of the best predictors for student success is exposure to
              course material before studying it. You're encouraged to read
              about the fundamentals of Swift in this study guide before
              starting. You can reference this guide in the menu throughout your
              progress, too.
            </p>
            <p style={{ marginBottom: 12 }}>
              Remember to fail faster and fail forward! The real education
              happens when you push through a challenge. We'll start off nice
              and easy at first, then level up in difficulty as you collect more
              progress. Make sure to use the tools at your disposal—you’re going
              to need them.
            </p>
          </div>
        ),
        metaData: `### Advice
This looks like ChatGPT content…but it’s not—it's me, your instructor!

As a beginner:
1. Programming is about structuring data and logic, not advanced math.
2. Like spoken languages, you can express the same idea in many ways.
3. When something challenges you, break it into smaller steps and iterate quickly.

### Exposure
This guide exposes you to concepts before you answer questions, so you won’t be intimidated later. Skim it now, code along later.

### Core Concepts in Swift

\`\`\`swift
// Arrays
var myArray: [Any] = [1, 2, 3, "a", "b", "c"]
myArray.append("new data")

// Dictionaries
var dataSet: [String: Any] = [
    "introduction": "Welcome",
    "title": "Chapter 1",
    "isLive": true
]
dataSet["page"] = 4
dataSet["book"] = "Coding Basics"
\`\`\`

\`\`\`swift
// Defining a class
class House {
    private var housePaint: String?

    init(paint: String? = nil) {
        self.housePaint = paint
    }

    func getPaint() -> String? {
        return housePaint
    }

    func setPaint(_ paint: String) {
        housePaint = paint
    }

    func deletePaint() {
        housePaint = nil
    }
}

// Usage
let firstHome = House(paint: "pink")
let nextHome = House(paint: "blue")
print(firstHome.getPaint()!)   // "pink"
\`\`\`

### SwiftUI Quick Preview

\`\`\`swift
import SwiftUI

struct CelebrationView: View {
    let message: String

    var body: some View {
        VStack {
            Text("Good job!")
                .font(.title)
                .padding(.bottom, 8)
            Text(message)
                .multilineTextAlignment(.center)
                .padding()
                .border(Color.black, width: 2)
        }
    }
}

// Preview in Xcode
struct CelebrationView_Previews: PreviewProvider {
    static var previews: some View {
        CelebrationView(message: "You created a small app!")
    }
}
\`\`\`

### Conclusion
Failing fast is in your best interest when learning a new language. This one-pager will be available inside the app. Good luck, and happy coding in Swift!`,
      },
    },

    {
      group: "tutorial",
      title: "Understanding Coding",
      description: "Grasp the basic concept of coding in Swift.",
      isMultipleChoice: true,
      question: {
        questionText: "Which of the following best describes coding?",
        options: [
          "Writing instructions for computers to perform tasks",
          "Creating physical components for computers",
          "Designing user interfaces",
          "Managing databases",
        ],
        answer: "Writing instructions for computers to perform tasks",
      },
    },
    {
      group: "tutorial",
      title: "Sequence of Program Execution",
      description: "Learn the correct order of program execution.",
      isSelectOrder: true,
      question: {
        questionText:
          "Arrange the steps with drag-and-drop to order how a Swift program is built and run.",
        options: [
          "Writing Code",
          "Code Compilation",
          "Debugging",
          "Program Execution",
        ],
        answer: [
          "Writing Code",
          "Code Compilation",
          "Debugging",
          "Program Execution",
        ],
      },
    },
    {
      group: "tutorial",
      title: "Introduction to Variables",
      description:
        "In this step, you will learn about variables and how to declare them in Swift.",
      isMultipleAnswerChoice: true,
      question: {
        questionText:
          "Select all the steps involved in correctly declaring a variable in Swift:",
        options: [
          "Use the var or let keyword",
          "Choose a descriptive variable name",
          "Assign a value using the equals sign (=)",
          "End the declaration with a semicolon (;)",
          "Capitalize the first letter of the variable name",
          "Annotate the type explicitly (optional)",
        ],
        answer: [
          "Use the var or let keyword",
          "Choose a descriptive variable name",
          "Assign a value using the equals sign (=)",
        ],
      },
    },
    {
      group: "tutorial",
      title: "Understanding List Declarations",
      description:
        "Complete the code by selecting the correct way to declare an array of items in Swift.",
      isCodeCompletion: true,
      question: {
        questionText:
          "Which code block correctly declares a list of items in Swift?",
        options: [
          `let items = ["apple", "banana", "cherry"]`,
          `var items: [String] = ["apple", "banana", "cherry"]`,
          `let items = ("apple", "banana", "cherry")`,
          `let items = "apple, banana, cherry"`,
          `class Items {\n    // properties here\n}`,
        ],
        answer: `let items = ["apple", "banana", "cherry"]`,
      },
    },
    {
      group: "tutorial",
      title: "Variable Assignment in Swift",
      description: "Learn how to assign values to variables in Swift.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Declare a variable named `age` and assign it the value 25.",
      },
    },
    {
      group: "tutorial",
      title: "Understanding Data Types",
      description: "Learn the basics of data types in Swift.",
      isSingleLineText: true,
      question: {
        questionText: "What keyword is used to declare a constant in Swift?",
        placeholder: "Type your answer here...",
        answer: "let",
      },
    },
    {
      group: "tutorial",
      title: "Purpose of Variables",
      description: "Understand why variables are used in programming.",
      isText: true,
      question: {
        questionText:
          "In your own words, explain the purpose of variables in programming.",
      },
    },
    {
      group: "tutorial",
      title: "Bash Terminal Practice: Changing Directories",
      description: "Practice changing directories in a terminal environment.",
      isCode: true,
      isTerminal: true,
      question: {
        questionText:
          "Enter the command to change to the `new_folder` directory using a Bash terminal.",
      },
    },
    {
      group: "tutorial",
      title: "Review With AI Conversation (optional)",
      isConversationReview: true,
      description: "Review the subjects you've answered",
      question: {
        questionText: "Let's chat about the questions we've worked on so far.",
        range: [1, 8],
      },
    },
    // 1
    {
      group: "1",
      title: "Data Types in Programming",
      description: "Identify different primitive data types used in Swift.",
      isMultipleAnswerChoice: true,
      question: {
        questionText:
          "Which of the following are primitive data types in Swift?",
        options: ["String", "Int", "Float", "Double", "Bool", "Character"],
        answer: ["String", "Int", "Float", "Double", "Bool", "Character"],
      },
    },
    // 2
    {
      group: "1",
      title: "Steps to Create a Function",
      description: "Understand the sequence of creating and using a function.",
      isSelectOrder: true,
      question: {
        questionText:
          "Arrange the steps with drag-and-drop to create and use a Swift function.",
        options: [
          "Define the function",
          "Call the function",
          "Execute the function body",
          "Return a value",
        ],
        answer: [
          "Define the function",
          "Call the function",
          "Execute the function body",
          "Return a value",
        ],
      },
    },
    // 3
    {
      group: "1",
      title: "Writing a Simple Function",
      description: "Practice writing functions in Swift.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Write a function named `greet` that takes a `name: String` parameter and prints a greeting with that name.",
      },
    },
    // 4
    {
      group: "1",
      title: "Functions in Programming",
      description: "Discuss the role of functions.",
      isText: true,
      question: {
        questionText:
          "What is a function, and why is it useful in programming?",
      },
    },
    // 5
    {
      group: "1",
      title: "Conditional Statements",
      description: "Identify the purpose of conditional statements.",
      isMultipleChoice: true,
      question: {
        questionText: "What is the primary purpose of an `if` statement?",
        options: [
          "To repeat a block of code multiple times",
          "To execute a block of code based on a condition",
          "To define a variable",
          "To import external libraries",
        ],
        answer: "To execute a block of code based on a condition",
      },
    },
    // 6
    {
      group: "1",
      title: "Order of Conditional Checks",
      description:
        "Complete the code that evaluates an `if`/`else if`/`else` statement.",
      isCodeCompletion: true,
      question: {
        questionText:
          "Complete the following Swift code to check if `x` is greater than 10, equal to 10, or less than 10.",
        options: [
          // 1) Correct order and operators
          `if x > 10 {
    print("x is greater than 10")
} else if x == 10 {
    print("x is equal to 10")
} else {
    print("x is less than 10")
}`,

          // 2) Swapped the first two checks (wrong logic)
          `if x == 10 {
    print("x is equal to 10")
} else if x > 10 {
    print("x is greater than 10")
} else {
    print("x is less than 10")
}`,

          // 3) Missing the else-if branch entirely
          `if x > 10 {
    print("x is greater than 10")
} else {
    print("x is not greater than 10")
}`,

          // 4) Used >= instead of == for equality check
          `if x > 10 {
    print("x is greater than 10")
} else if x >= 10 {
    print("x is equal to 10")
} else {
    print("x is less than 10")
}`,
        ],
        answer: `if x > 10 {
    print("x is greater than 10")
} else if x == 10 {
    print("x is equal to 10")
} else {
    print("x is less than 10")
}`,
      },
    },
    // 7
    {
      group: "1",
      title: "Implementing Conditional Logic",
      description: "Apply conditional logic in code.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Write an `if`/`else if`/`else` statement that checks if a number `num` is positive, negative, or zero, and prints an appropriate message.",
      },
    },
    // 8
    {
      group: "1",
      title: "Understanding Conditional Logic in Programming",
      description:
        "Learn how logical operators like AND and OR control conditions in programming.",
      isSingleLineText: true,
      question: {
        questionText:
          "Which logical operator is used to check if both conditions in a conditional statement are true in Swift?",
        placeholder: "Type your answer here...",
        answer: "&&",
      },
    },
    // 9
    {
      group: "1",
      title: "Real-world Use of Conditionals",
      description: "Reflect on how conditionals are used.",
      isText: true,
      question: {
        questionText:
          "Provide an example of how conditional statements are used in real-world applications.",
      },
    },
    // 10
    {
      group: "1",
      title: "Terminal Practice: Help Command",
      description: "Write the help command to observe basic commands.",
      isCode: true,
      isTerminal: true,
      question: {
        questionText:
          "In a Bash terminal environment, enter the help command to discover basic commands.",
      },
    },
    // 11
    {
      group: "1",
      title: "Loops in Programming",
      description: "Understand the purpose of loops.",
      isMultipleChoice: true,
      question: {
        questionText:
          "Which loop will continue executing as long as its condition remains true in Swift?",
        options: [
          "for-in loop",
          "while loop",
          "repeat-while loop",
          "forEach method",
        ],
        answer: "while loop",
      },
    },
    // 12
    {
      group: "1",
      title: "Sequence of Loop Execution",
      description: "Grasp the order in which loops execute.",
      isSelectOrder: true,
      question: {
        questionText:
          "Arrange the steps of a Swift `for-in` loop execution with drag-and-drop.",
        options: [
          "Initialize iterator",
          "Check condition",
          "Execute code block",
          "Advance iterator",
        ],
        answer: [
          "Initialize iterator",
          "Check condition",
          "Execute code block",
          "Advance iterator",
        ],
      },
    },
    // 13
    {
      group: "1",
      title: "Creating a Loop",
      description: "Practice writing loops.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Write a `for i in 1...5 { print(i) }` loop that prints numbers from 1 to 5 in Swift.",
      },
    },
    // 14
    {
      group: "1",
      title: "Applications of Loops",
      description: "Discuss where loops are useful.",
      isText: true,
      question: {
        questionText:
          "Describe a scenario in software development where loops are essential.",
      },
    },
    // 15
    {
      group: "1",
      title: "Arrays in Swift",
      description: "Identify methods used for manipulating arrays in Swift.",
      isMultipleAnswerChoice: true,
      question: {
        questionText:
          "Which of the following methods are valid for manipulating arrays in Swift?",
        options: [
          ".append()",
          ".removeLast()",
          ".remove(at:)",
          ".insert(_:at:)",
          ".map()",
          ".filter()",
        ],
        answer: [
          ".append()",
          ".removeLast()",
          ".remove(at:)",
          ".insert(_:at:)",
          ".map()",
          ".filter()",
        ],
      },
    },
    // 16
    {
      group: "1",
      title: "Order of Array Operations",
      description: "Understand how array operations are performed.",
      isCodeCompletion: true,
      question: {
        questionText:
          "Complete the code to declare an array, add an element to it, remove the first element, and then access an element.",
        options: [
          // 1) Correct sequence
          `var fruits = ["apple", "banana"]
fruits.append("pink")
fruits.removeFirst()
print(fruits[0])`,

          // 2) Missing the removal step
          `var fruits = ["apple", "banana"]
fruits.append("pink")
print(fruits[0])`,

          // 3) Operations in the wrong order
          `var fruits = ["apple", "banana"]
fruits.removeFirst()
fruits.append("pink")
print(fruits[0])`,

          // 4) Accessing the wrong index
          `var fruits = ["apple", "banana"]
fruits.append("pink")
fruits.removeFirst()
print(fruits[1])`,
        ],
        answer: `var fruits = ["apple", "banana"]
fruits.append("pink")
fruits.removeFirst()
print(fruits[0])`,
      },
    },
    // 17
    {
      group: "1",
      title: "Manipulating Arrays",
      description: "Apply array methods in code.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          'Create an array `fruits` with "apple" and "banana". Add "pink" to the end and remove the first element.',
      },
    },
    // 18
    {
      group: "1",
      title: "Use Cases for Arrays",
      description: "Explore scenarios where arrays are used.",
      isText: true,
      question: {
        questionText:
          "Provide an example of how an array can be used to manage data in an iOS application.",
      },
    },
    // 19
    {
      group: "1",
      title: "Terminal Practice: Creating Directories",
      description: "Creating a directory command in a bash terminal",
      isCode: true,
      isTerminal: true,
      question: {
        questionText:
          "In a Bash terminal environment, create a directory called `app` using the `mkdir` command.",
      },
    },
    // 20
    {
      group: "1",
      title: "Advanced Coding Output",
      description:
        "Predict the output of the following code with arrays, conditionals, logical operators, and array operations.",
      isSingleLineText: true,
      question: {
        questionText: (
          <div>
            What will be the output of the following code?
            <br />
            <pre>
              {`
var arr = [1, 2, 3, 4]
let x = 10
let y = 5

if x > y && arr.count > 3 {
    arr.append(x)
    arr = arr.filter { $0 % 2 == 0 }
}

print(arr)
`}
            </pre>
          </div>
        ),
        placeholder: "Type your answer here...",
        answer: "[2, 4, 10]",
      },
    },
    // 21
    {
      group: "1",
      title: "Review With AI Conversation (optional)",
      isConversationReview: true,
      description: "Review the subjects you've answered",
      question: {
        questionText: "Let's chat about the questions we've worked on so far.",
        range: [10, 29],
      },
    },
    // 1
    {
      group: "2",
      title: "Introduction to Objects",
      description:
        "In this step, you will learn what an object is in programming.",
      isSingleLineText: true,
      question: {
        questionText: "In Swift, how do you create a new instance of a class?",
        placeholder: "Type your answer here...",
        answer: "Call the class initializer, e.g. MyClass()",
      },
    },
    // 2
    {
      group: "2",
      title: "Understanding the init Method",
      description:
        "In this step, you will learn about the purpose of the `init` method in a class.",
      isCodeCompletion: true,
      question: {
        questionText:
          "Which of the following code blocks correctly defines the `init` method and instantiates the class in Swift?",
        options: [
          `class Car {
    var brand: String
    init(brand: String) {
        self.brand = brand
    }
}
let myCar = Car(brand: "Toyota")`,
          `class Car {
    var brand: String
    func init(brand: String) {
        self.brand = brand
    }
}
let myCar = Car(brand: "Toyota")`,
          `class Car {
    var brand: String
    init(_ brand: String) {
        self.brand = brand
    }
}
let myCar = Car("Toyota")`,
          `class Car {
    var brand: String?
    init() {
        brand = "Toyota"
    }
}
let myCar = Car()`,
        ],
        answer: `class Car {
    var brand: String
    init(brand: String) {
        self.brand = brand
    }
}
let myCar = Car(brand: "Toyota")`,
      },
    },
    // 3
    {
      group: "2",
      title: "Purpose of the init Method",
      description:
        "In this step, you will learn about the purpose of the `init` method in a class.",
      isText: true,
      question: {
        questionText:
          "Explain the purpose of the `init` method in a Swift class.",
      },
    },
    // 4
    {
      group: "2",
      title: "Creating an Instance of a Class",
      description:
        "In this step, you will learn how to create an instance of a class in Swift.",
      isMultipleAnswerChoice: true,
      question: {
        questionText:
          "Select all the correct steps required to create an instance of a class in Swift:",
        options: [
          "Define the class with the `class` keyword",
          "Call the class initializer with parentheses",
          "Pass required parameters to the initializer",
          "Store the returned instance in a variable",
          "Use the `new` keyword",
          "Call the class without parentheses",
        ],
        answer: [
          "Define the class with the `class` keyword",
          "Call the class initializer with parentheses",
          "Pass required parameters to the initializer",
          "Store the returned instance in a variable",
        ],
      },
    },
    // 5
    {
      group: "2",
      title: "Declaring a Method in a Class",
      description:
        "In this step, you will learn how to declare a method inside a class.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Declare a method named `updateModel()` in the `Car` class that updates the `model` property.",
      },
    },
    // 6
    {
      group: "2",
      title: "Using self",
      description:
        "Complete the code by selecting the correct way to use `self` to refer to the instance property.",
      isCodeCompletion: true,
      question: {
        questionText:
          "Which code block correctly uses `self` to refer to the object's property?",
        options: [
          `class Car {
    var brand: String
    init(brand: String) { self.brand = brand }
    func showBrand() { print(brand) }
}
let myCar = Car(brand: "Toyota")
myCar.showBrand()`,
          `class Car {
    var brand: String
    init(brand: String) { self.brand = brand }
    func showBrand() { print(self.brand) }
}
let myCar = Car(brand: "Toyota")
myCar.showBrand()`,
          `class Car {
    var brand: String
    init(brand: String) { brand = self.brand }
    func showBrand() { print(self.brand) }
}
let myCar = Car(brand: "Toyota")
myCar.showBrand()`,
          `class Car {
    var brand: String
    init(brand: String) { self.brand = brand }
    func showBrand() { print(self.brand()) }
}
let myCar = Car(brand: "Toyota")
myCar.showBrand()`,
        ],
        answer: `class Car {
    var brand: String
    init(brand: String) { self.brand = brand }
    func showBrand() { print(self.brand) }
}
let myCar = Car(brand: "Toyota")
myCar.showBrand()`,
      },
    },
    // 7
    {
      group: "2",
      title: "Adding Properties to an Object",
      description:
        "In this step, you will learn how to add properties to a Swift class.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText: "Add a new property `year: Int` to the `Car` class.",
      },
    },
    // 8
    {
      group: "2",
      title: "Accessing and Modifying Object Properties",
      description:
        "In this step, you will learn how to get or set properties of an object in Swift.",
      isMultipleAnswerChoice: true,
      question: {
        questionText:
          "Which of the following are valid ways to get or set properties in Swift?",
        options: [
          "Use dot notation (e.g., obj.property)",
          "Use custom getter/setter if defined",
          "Use Key-Value Coding (KVC)",
          "Use reflection APIs",
        ],
        answer: [
          "Use dot notation (e.g., obj.property)",
          "Use custom getter/setter if defined",
        ],
      },
    },
    // 9
    {
      group: "2",
      title: "Modifying Object Properties",
      description:
        "In this step, you will learn how to modify properties of an object.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Modify the `model` property of an instance of the `Car` class.",
      },
    },
    // 10
    {
      group: "2",
      title: "Understanding Inheritance",
      description:
        "In this step, you will learn about inheritance in object-oriented programming.",
      isText: true,
      question: {
        questionText: "What is inheritance in object-oriented programming?",
      },
    },
    // 11
    {
      group: "2",
      title: "Implementing Inheritance",
      description:
        "In this step, you will implement inheritance in Swift by subclassing.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Extend the `Car` class to create an `ElectricCar` subclass with an additional property `batteryLife: Int`.",
      },
    },
    // 12
    {
      group: "2",
      title: "Overriding Methods",
      description:
        "In this step, you will learn how to override methods in a subclass.",
      isMultipleChoice: true,
      question: {
        questionText: "What does it mean to override a method in a subclass?",
        options: [
          "Provide a new implementation for a superclass method",
          "Delete the superclass method",
          "Call the superclass method without changes",
          "Extend functionality via super.method()",
        ],
        answer: "Provide a new implementation for a superclass method",
      },
    },
    // 13
    {
      group: "2",
      title: "Understanding Encapsulation",
      description:
        "In this step, you will learn about encapsulation in object-oriented programming.",
      isText: true,
      question: {
        questionText: "What is encapsulation in object-oriented programming?",
      },
    },
    // 14
    {
      group: "2",
      title: "Implementing Encapsulation",
      description:
        "In this step, you will implement encapsulation by using computed properties.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Add a computed property `batteryLife` with get and set in the `ElectricCar` subclass.",
      },
    },
    // 15
    {
      group: "2",
      title: "Encapsulation Concept",
      description:
        "In this step, you will define the core concept of encapsulation in one word.",
      isSingleLineText: true,
      question: {
        questionText:
          "What is the primary concept encapsulation ensures in object-oriented programming?",
        placeholder: "Type your answer here...",
        answer: "Abstraction",
      },
    },
    // 16
    {
      group: "2",
      title: "Combining Concepts",
      description:
        "In this step, you will combine various concepts learned to create a small project.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Create a small project that defines a `Person` class, uses inheritance to create a `Student` subclass, and demonstrates encapsulation and arrays of objects in Swift.",
      },
    },
    // 17
    {
      group: "2",
      title: "Printing in Code",
      description: "In this step, you will print a message using Swift code.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Write a Swift statement to print: 'I'm talking to the inside of a computer!'",
      },
    },
    // 18
    {
      group: "2",
      title: "Review With AI Conversation (optional)",
      isConversationReview: true,
      description: "Review the subjects you've answered",
      question: {
        questionText: "Let's chat about the questions we've worked on so far.",
        range: [31, 47],
      },
    },
    // 1
    {
      group: "3",
      title: "Introduction to SwiftUI Views",
      description:
        "In this step, you will learn about SwiftUI views, their role in creating reusable UI elements, and how they help manage the user interface efficiently.",
      isMultipleChoice: true,
      question: {
        questionText: "Which of the following best describes a SwiftUI view?",
        options: [
          "A method for handling events in Swift",
          "A feature exclusive to UIKit",
          "A reusable piece of user interface defined as a struct or class conforming to View",
          "A built-in HTML element in Swift",
        ],
        answer:
          "A reusable piece of user interface defined as a struct or class conforming to View",
      },
    },
    // 2
    {
      group: "3",
      title: "Key Concepts in SwiftUI",
      description:
        "In this step, you will learn about fundamental SwiftUI concepts, including properties, state, modifiers, and layout containers.",
      isMultipleAnswerChoice: true,
      question: {
        questionText: "Which of the following are key concepts in SwiftUI?",
        options: [
          "@State for local mutable state",
          "Directly manipulating the view hierarchy",
          "View modifiers for styling and behavior",
          "HStack, VStack, ZStack for layout",
        ],
        answer: [
          "@State for local mutable state",
          "View modifiers for styling and behavior",
          "HStack, VStack, ZStack for layout",
        ],
      },
    },
    // 3
    {
      group: "3",
      title: "Effect of State Changes on a View",
      description:
        "In this step, you will explain what happens to a SwiftUI view when its @State changes.",
      isText: true,
      question: {
        questionText:
          "What happens to a SwiftUI view when its @State property changes?",
      },
    },
    // 4
    {
      group: "3",
      title: "Creating a Simple SwiftUI View",
      description:
        "In this step, you will define a basic SwiftUI view that displays a heading and a text.",
      isCodeCompletion: true,
      question: {
        questionText:
          "Which of the following code blocks correctly defines a simple SwiftUI view that shows a title and subtitle?",
        options: [
          `struct MyView: View {
    var body: some View {
        VStack {
            Text("Hello, World!")
            Text("Welcome to the thunderdome")
        }
    }
}`,
          `class MyView: View {
    func body() -> some View {
        VStack {
            Text("Hello, World!")
            Text("Welcome to the thunderdome")
        }
    }
}`,
          `struct MyView {
    var body: some View {
        VStack {
            Text("Hello, World!")
            Text("Welcome to the thunderdome")
        }
    }
}`,
          `struct MyView: View {
    var content: some View {
        VStack {
            Text("Hello, World!")
            Text("Welcome to the thunderdome")
        }
    }
}`,
        ],
        answer: `struct MyView: View {
    var body: some View {
        VStack {
            Text("Hello, World!")
            Text("Welcome to the thunderdome")
        }
    }
}`,
      },
    },
    // 5
    {
      group: "3",
      title: "Handling Tap Gestures",
      description:
        "In this step, you will handle a button tap event using SwiftUI's modifiers.",
      isCodeCompletion: true,
      question: {
        questionText:
          "Which of the following code blocks correctly defines a SwiftUI view that handles a button tap?",
        options: [
          `Button("Click me") {
    print("Button clicked!")
}`,
          `Button(action: {
    print("Button clicked!")
}) {
    Text("Click me")
}`,
          `Button("Click me", action: print("Button clicked!"))`,
          `Button {
    Text("Click me")
} onTap: {
    print("Button clicked!")
}`,
        ],
        answer: `Button("Click me") {
    print("Button clicked!")
}`,
      },
    },
    // 6
    {
      group: "3",
      title: "Managing State with @State",
      description:
        "In this step, you will learn how to use the @State property wrapper to manage local view state.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Modify the TweetView to include a like button that toggles a `@State var liked: Bool` property.",
      },
    },
    // 7
    {
      group: "3",
      title: "View Properties",
      description:
        "In this step, you will learn about passing data into SwiftUI views.",
      isSingleLineText: true,
      question: {
        questionText:
          "What is the term used for data passed into a SwiftUI view?",
        placeholder: "Type your answer here...",
        answer: "View properties (initializer parameters)",
      },
    },
    // 8
    {
      group: "3",
      title: "Passing and Using Properties",
      description:
        "In this step, you will learn how to pass and use properties in a SwiftUI view.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Update the TweetView to accept and display the user’s `name`, `handle`, and `content` as view properties.",
      },
    },
    // 9
    {
      group: "3",
      title: "Working with Properties and State Together",
      description:
        "In this step, you will learn the difference between properties and @State.",
      isMultipleChoice: true,
      question: {
        questionText:
          "What is the main difference between view properties and @State?",
        options: [
          "Properties are immutable while @State is mutable",
          "Properties trigger view updates while @State does not",
          "@State is passed from parent views, properties are local",
          "There is no difference; they behave the same",
        ],
        answer: "Properties are immutable while @State is mutable",
      },
    },
    // 10
    {
      group: "3",
      title: "Terminal Practice: Listing Files",
      description:
        "In this step, you will learn how to list files in a bash terminal.",
      isCode: true,
      isTerminal: true,
      question: {
        questionText:
          "Use the terminal to list all files using the `ls` command.",
      },
    },
    // 11
    {
      group: "3",
      title: "Styling SwiftUI Views",
      description:
        "In this step, you will learn how to style SwiftUI views using modifiers.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Add modifiers to the TweetView to set font, padding, background, and corner radius.",
      },
    },
    // 12
    {
      group: "3",
      title: "Using Stacks for Layout",
      description:
        "In this step, you will learn how to use HStack and VStack for layout in SwiftUI.",
      isSelectOrder: true,
      question: {
        questionText:
          "Arrange the following in the order needed to center content using VStack and modifiers:",
        options: [
          "VStack { }",
          ".frame(maxWidth: .infinity, maxHeight: .infinity)",
          ".background(Color.white)",
          ".multilineTextAlignment(.center)",
        ],
        answer: [
          "VStack { }",
          ".frame(maxWidth: .infinity, maxHeight: .infinity)",
          ".multilineTextAlignment(.center)",
          ".background(Color.white)",
        ],
      },
    },
    // 13
    {
      group: "3",
      title: "Lifting State Up",
      description:
        "In this step, you will learn how to lift state to a parent view to share data.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Create a parent view that manages an array of Tweet models with @State and passes bindings to child TweetViews.",
      },
    },
    // 14
    {
      group: "3",
      title: "Using onAppear for Side Effects",
      description:
        "In this step, you will learn how to use onAppear to handle side effects in a SwiftUI view.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Modify the TweetView to use `.onAppear` or `.onChange` to log a message when the retweet count changes.",
      },
    },
    // 15
    {
      group: "3",
      title: "Understanding View Lifecycle",
      description:
        "In this step, you will learn about the SwiftUI view lifecycle and the purpose of onAppear.",
      isText: true,
      question: {
        questionText:
          "What is the SwiftUI view lifecycle, and what is the purpose of onAppear?",
      },
    },
    // 16
    {
      group: "3",
      title: "Fetching Data with async/await",
      description:
        "In this step, you will learn how to fetch data from an API using async/await in SwiftUI.",
      isSelectOrder: true,
      question: {
        questionText:
          "Arrange the steps to correctly fetch data in a SwiftUI view using async/await:",
        options: [
          "Import SwiftUI and Foundation",
          "Define @State var data",
          "Use Task { await fetchData() } in .task modifier",
          "Handle errors with do/catch",
          "Update state with received data",
          "Render data in view",
        ],
        answer: [
          "Import SwiftUI and Foundation",
          "Define @State var data",
          "Use Task { await fetchData() } in .task modifier",
          "Handle errors with do/catch",
          "Update state with received data",
          "Render data in view",
        ],
      },
    },
    // 17
    {
      group: "3",
      title: "Building a Complete Tweet App",
      description:
        "In this step, you will combine everything you have learned to build a complete Tweet app in SwiftUI.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Build a SwiftUI Tweet app that fetches tweets via async/await, displays them in a List, and allows users to like and retweet.",
      },
    },
    // 18
    {
      group: "3",
      title: "Terminal Practice: Creating a Swift Package",
      description:
        "In this step, you will learn how to initialize a Swift package using the terminal.",
      isText: true,
      question: {
        questionText:
          "Enter the command to create a new Swift package: `swift package init --type executable`.",
      },
    },
    // 19
    {
      group: "3",
      title: "Creating a New SwiftUI Project",
      description:
        "In this step, you will learn how to create a new SwiftUI project in Xcode.",
      isSelectOrder: true,
      question: {
        questionText: "Arrange the steps to create a new SwiftUI app in Xcode:",
        options: [
          "Open Xcode and select File > New > Project",
          "Choose App template and click Next",
          "Select SwiftUI for Interface and Swift for Language",
          "Enter product name and organization identifier",
          "Choose a location and create the project",
        ],
        answer: [
          "Open Xcode and select File > New > Project",
          "Choose App template and click Next",
          "Select SwiftUI for Interface and Swift for Language",
          "Enter product name and organization identifier",
          "Choose a location and create the project",
        ],
      },
    },
    // 20
    {
      group: "3",
      title: "Review With AI Conversation (optional)",
      isConversationReview: true,
      description: "Review the subjects you've answered",
      question: {
        questionText: "Let's chat about the questions we've worked on so far.",
        range: [49, 67],
      },
    },
    // 1
    {
      group: "4",
      title: "Introduction to Swift Backend Engineering with Vapor",
      description:
        "In this step, you will learn what backend software engineering is and why it is important.",
      isText: true,
      question: {
        questionText:
          "What is backend software engineering and why is it important in building applications?",
      },
    },
    // 2
    {
      group: "4",
      title: "Main Lessons Overview",
      description:
        "In this step, you will identify a core responsibility of backend engineering in Swift.",
      isMultipleChoice: true,
      question: {
        questionText:
          "Which of the following is a core responsibility in backend engineering?",
        options: [
          "Managing concurrency and ensuring thread safety in multi-user applications",
          "Implementing user authentication directly in the UI layer",
          "Handling memory allocation in the Swift runtime",
          "Designing scalable UI components for cross-platform compatibility",
          "Optimizing database queries and ensuring data consistency",
        ],
        answer: "Optimizing database queries and ensuring data consistency",
      },
    },
    // 3
    {
      group: "4",
      title: "Key Responsibilities of Backend Engineering",
      description:
        "In this step, you will learn about the various responsibilities involved in Swift backend engineering with Vapor.",
      isMultipleAnswerChoice: true,
      question: {
        questionText:
          "Which of the following are core responsibilities of backend engineering?",
        options: [
          "Managing and optimizing databases for storing and retrieving data efficiently",
          "Designing and implementing RESTful APIs using Vapor",
          "Ensuring security through user authentication and authorization mechanisms",
          "Handling server-side logic, including business operations and calculations",
          "Maintaining server reliability and performance under high traffic",
          "Managing data integrity and consistency across distributed systems",
          "Implementing logging and monitoring to ensure system health and debug issues",
        ],
        answer: [
          "Managing and optimizing databases for storing and retrieving data efficiently",
          "Designing and implementing RESTful APIs using Vapor",
          "Ensuring security through user authentication and authorization mechanisms",
          "Handling server-side logic, including business operations and calculations",
          "Maintaining server reliability and performance under high traffic",
          "Managing data integrity and consistency across distributed systems",
          "Implementing logging and monitoring to ensure system health and debug issues",
        ],
      },
    },
    // 4
    {
      group: "4",
      title: "Interfacing with the Terminal",
      description:
        "In this step, you will learn about using the terminal in Swift backend engineering.",
      isText: true,
      question: {
        questionText:
          "Why is learning to use the terminal important for backend development, and what tasks can you perform using it?",
      },
    },
    // 5
    {
      group: "4",
      title: "Installing the Vapor Toolbox",
      description:
        "In this step, you will learn how to install the Vapor CLI globally.",
      isText: true,
      question: {
        questionText:
          "Write the command to install the Vapor Toolbox using Homebrew.",
      },
    },
    // 6
    {
      group: "4",
      title: "Adding a Swift Package with SwiftPM",
      description:
        "In this step, you will use Swift Package Manager to add a dependency.",
      isText: true,
      question: {
        questionText:
          "Write the command to add the FluentPostgresDriver package via SwiftPM.",
      },
    },
    // 7
    {
      group: "4",
      title: "User Creation and Authentication",
      description:
        "In this step, you will understand the key concept related to creating users in backend systems.",
      isSingleLineText: true,
      question: {
        questionText:
          "What is the process called that verifies a user's identity during account creation?",
        placeholder: "Type your answer here...",
        answer: "authentication",
      },
    },
    // 8
    {
      group: "4",
      title: "Database Foundations",
      description:
        "In this step, you will learn about the foundations of databases in backend engineering.",
      isText: true,
      question: {
        questionText:
          "What are the main types of databases used in backend engineering?",
      },
    },
    // 9
    {
      group: "4",
      title: "Connecting to PostgreSQL with Fluent",
      description:
        "In this step, you will write a code snippet to connect a Vapor app to a PostgreSQL database.",
      isCode: true,
      question: {
        questionText:
          "Write a Swift code snippet using FluentPostgresDriver to configure the database connection.",
      },
    },
    // 10
    {
      group: "4",
      title: "Initiating a Vapor Project",
      description:
        "In this step, you will learn how to start a new Vapor project using the CLI.",
      isSingleLineText: true,
      question: {
        questionText: "What is the command to create a new Vapor API project?",
        answer: "vapor new MyApp --api",
      },
    },
    // 11
    {
      group: "4",
      title: "Advanced Data Storage Practices",
      description:
        "In this step, you will learn advanced practices for storing data responsibly in backend systems.",
      isMultipleAnswerChoice: true,
      question: {
        questionText:
          "Which of the following are best practices for ensuring responsible data storage in a backend system?",
        options: [
          "Cache data in memory (e.g., Redis) to reduce database access time",
          "Use a single centralized backup to reduce complexity and cost",
          "Encrypt sensitive data both at rest and in transit to ensure security",
          "Implement database replication across multiple servers to improve fault tolerance",
        ],
        answer: [
          "Cache data in memory (e.g., Redis) to reduce database access time",
          "Encrypt sensitive data both at rest and in transit to ensure security",
          "Implement database replication across multiple servers to improve fault tolerance",
        ],
      },
    },
    // 12
    {
      group: "4",
      title: "Configuring Fluent and Running Migrations",
      description:
        "In this step, you will learn how to initialize Fluent and run migrations in Vapor.",
      isCodeCompletion: true,
      question: {
        questionText:
          "Complete the code to configure PostgreSQL and register a User migration in Vapor.",
        options: [
          // 1) Correct configuration, migration registration, and await
          `import Fluent
import FluentPostgresDriver
import Vapor

public func configure(_ app: Application) throws {
    app.databases.use(.postgres(
        hostname: "localhost",
        username: "user",
        password: "pass",
        database: "db"
    ), as: .psql)
    app.migrations.add(CreateUser())
    try app.autoMigrate().wait()
}`,

          // 2) Missing the .wait() on autoMigrate
          `import Fluent
import FluentPostgresDriver
import Vapor

public func configure(_ app: Application) throws {
    app.databases.use(.postgres(
        hostname: "localhost",
        username: "user",
        password: "pass",
        database: "db"
    ), as: .psql)
    app.migrations.add(CreateUser())
    try app.autoMigrate()  // forgot .wait()
}`,

          // 3) Wrong driver (MySQL) instead of Postgres
          `import Fluent
import FluentMySQLDriver
import Vapor

public func configure(_ app: Application) throws {
    app.databases.use(.mysql(
        hostname: "localhost",
        username: "user",
        password: "pass",
        database: "db"
    ), as: .mysql)
    app.migrations.add(CreateUser())
    try app.autoMigrate().wait()
}`,

          // 4) Registered database but forgot to add the migration
          `import Fluent
import FluentPostgresDriver
import Vapor

public func configure(_ app: Application) throws {
    app.databases.use(.postgres(
        hostname: "localhost",
        username: "user",
        password: "pass",
        database: "db"
    ), as: .psql)
    try app.autoMigrate().wait()  // missing app.migrations.add(CreateUser())
}`,
        ],
        answer: `import Fluent
import FluentPostgresDriver
import Vapor

public func configure(_ app: Application) throws {
    app.databases.use(.postgres(
        hostname: "localhost",
        username: "user",
        password: "pass",
        database: "db"
    ), as: .psql)
    app.migrations.add(CreateUser())
    try app.autoMigrate().wait()
}`,
      },
    },
    // 13
    {
      group: "4",
      title: "Handling User Data",
      description:
        "In this step, you will learn how to retrieve a User model instance.",
      isCode: true,
      question: {
        questionText:
          "Write a Vapor route handler to fetch a User by ID from the database.",
      },
    },
    // 14
    {
      group: "4",
      title: "Retrieving a User After Authentication",
      description:
        "In this step, you will learn how to retrieve the authenticated user.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Write code to retrieve the authenticated User from the request auth context in Vapor.",
      },
    },
    // 15
    {
      group: "4",
      title: "Understanding the Authentication Flow",
      description:
        "In this step, you will learn about the typical flow of JWT authentication in a backend system.",
      isSelectOrder: true,
      question: {
        questionText:
          "Arrange the following steps in the correct order for a typical JWT authentication flow in Vapor.",
        options: [
          "User submits credentials via POST",
          "Server verifies credentials against database",
          "JWT token is generated and signed",
          "Client stores token locally",
          "Protected routes validate token",
        ],
        answer: [
          "User submits credentials via POST",
          "Server verifies credentials against database",
          "JWT token is generated and signed",
          "Client stores token locally",
          "Protected routes validate token",
        ],
      },
    },
    // 16
    {
      group: "4",
      title: "OAuth Authentication",
      description:
        "In this step, you will learn about OAuth-style authentication systems.",
      isSingleLineText: true,
      question: {
        questionText:
          "What is the widely used protocol for authorization that allows third-party services to access user data without exposing credentials?",
        placeholder: "Type your answer here...",
        answer: "OAuth 2.0",
      },
    },
    // 17
    {
      group: "4",
      title: "Using Environment Variables",
      description:
        "In this step, you will learn about using environment variables in backend development.",
      isText: true,
      question: {
        questionText: "What role do environment variables play in a codebase?",
      },
    },
    // 18
    {
      group: "4",
      title: "Database Relationships with Fluent",
      description:
        "In this step, you will learn about defining relationships in Fluent.",
      isCode: true,
      question: {
        questionText:
          "Write a Fluent model snippet to define a one-to-many relationship between User and Post.",
      },
    },
    // 19
    {
      group: "4",
      title: "Interfacing with an API",
      description:
        "In this step, you will learn the common HTTP methods used to interface with an API.",
      isMultipleAnswerChoice: true,
      question: {
        questionText:
          "Which of the following HTTP methods are commonly used to interface with a REST API, and what do they do?",
        options: [
          "GET (Retrieves data)",
          "POST (Creates a new resource)",
          "PUT (Replaces a resource)",
          "PATCH (Partially updates a resource)",
          "DELETE (Deletes a resource)",
        ],
        answer: [
          "GET (Retrieves data)",
          "POST (Creates a new resource)",
          "PATCH (Partially updates a resource)",
          "DELETE (Deletes a resource)",
        ],
      },
    },
    // 20
    {
      group: "4",
      title: "Creating a JWT Authentication System",
      description:
        "In this step, you will create a simple user authentication system with JWT in Vapor.",
      isSelectOrder: true,
      question: {
        questionText:
          "Arrange the steps with drag-and-drop to implement JWT authentication in Vapor.",
        options: [
          "Add jwt-kit dependency",
          "Define User model",
          "Configure JWT signer",
          "Create register route",
          "Hash password before storing",
          "Create login route",
          "Verify credentials",
          "Generate JWT token",
          "Return token to client",
          "Protect routes with token middleware",
        ],
        answer: [
          "Add jwt-kit dependency",
          "Define User model",
          "Configure JWT signer",
          "Create register route",
          "Hash password before storing",
          "Create login route",
          "Verify credentials",
          "Generate JWT token",
          "Return token to client",
          "Protect routes with token middleware",
        ],
      },
    },
    // 21
    {
      group: "4",
      title: "Deploying a Vapor Application",
      description:
        "In this step, you will learn how to deploy a Vapor application.",
      isText: true,
      question: {
        questionText:
          "Write the command to run your Vapor app in production mode.",
      },
    },
    // 22
    {
      group: "4",
      title: "Review With AI Conversation (optional)",
      isConversationReview: true,
      description: "Review the subjects you've answered",
      question: {
        questionText: "Let's chat about the questions we've worked on so far.",
        range: [69, 89],
      },
    },
    // 1
    {
      group: "5",
      title: "Benefits of Serverless Cloud Platforms",
      description:
        "In this step, you will explore the advantages of using Firebase in iOS development.",
      isText: true,
      question: {
        questionText:
          "What are the key benefits of using Firebase as a serverless backend for an iOS app, and how does it differ from a traditional server-based model?",
      },
    },
    // 2
    {
      group: "5",
      title: "Understanding Xcode",
      description:
        "In this step, you will explore what Xcode is and why it is the primary IDE for iOS development.",
      isText: true,
      question: {
        questionText:
          "What is Xcode and why is it the most popular IDE among iOS developers?",
      },
    },
    // 3
    {
      group: "5",
      title: "Installing Swift and SwiftPM",
      description: "Install Swift and use the Swift Package Manager.",
      isText: true,
      question: {
        questionText:
          "What is the purpose of Swift and Swift Package Manager (SwiftPM) in iOS development?",
      },
    },
    // 4
    {
      group: "5",
      title: "Installing CocoaPods",
      description: "Set up CocoaPods to manage Firebase dependencies.",
      isSingleLineText: true,
      question: {
        questionText:
          "Enter the command to install CocoaPods on your macOS system.",
        answer: "sudo gem install cocoapods",
      },
    },
    // 5
    {
      group: "5",
      title: "Adding Firebase via CocoaPods",
      description: "Add Firebase SDK pods to your Xcode project.",
      isSingleLineText: true,
      question: {
        questionText:
          "What entry do you add under `pod 'Firebase/Core'` in your Podfile?",
        answer:
          "pod 'Firebase/Auth'\npod 'Firebase/Firestore'\npod 'Firebase/Storage'",
      },
    },
    // 6
    {
      group: "5",
      title: "Initializing a Firebase Project",
      description:
        "In this step, you will initialize Firebase in your iOS project by adding the config file.",
      isSingleLineText: true,
      question: {
        questionText:
          "What file do you download from the Firebase console and add to your Xcode project root?",
        answer: "GoogleService-Info.plist",
      },
    },
    // 7
    {
      group: "5",
      title: "Selecting Firebase Modules",
      description: "Choose which Firebase modules to include in your iOS app.",
      isMultipleAnswerChoice: true,
      question: {
        questionText:
          "Which of the following Firebase SDK modules might you enable for an iOS app?",
        options: [
          "Auth",
          "Firestore",
          "Realtime Database",
          "Cloud Functions",
          "Analytics",
          "Storage",
        ],
        answer: ["Auth", "Firestore", "Analytics", "Storage"],
      },
    },
    // 8
    {
      group: "5",
      title: "Configuring Firebase in AppDelegate",
      description:
        "Initialize Firebase in your AppDelegate or SwiftUI App entry point.",
      isCode: true,
      question: {
        questionText:
          "Write the Swift code to configure Firebase in AppDelegate `application(_:didFinishLaunchingWithOptions:)`.",
      },
    },
    // 9
    {
      group: "5",
      title: "Setting Up Firestore",
      description: "Learn how to initialize and use Firestore in Swift.",
      isCode: true,
      question: {
        questionText:
          "Write the Swift code to get a Firestore instance and add a document to `users` collection.",
      },
    },
    // 10
    {
      group: "5",
      title: "Understanding Authentication",
      description:
        "In this step, you will learn about Firebase Authentication in iOS.",
      isText: true,
      question: {
        questionText:
          "What is Firebase Authentication, and which sign-in methods does it support on iOS?",
      },
    },
    // 11
    {
      group: "5",
      title: "Creating a User with FirebaseAuth",
      description: "Create a new user account programmatically in Swift.",
      isCode: true,
      question: {
        questionText:
          "Write Swift code using `Auth.auth().createUser` with email and password.",
      },
    },
    // 12
    {
      group: "5",
      title: "Verifying ID Tokens",
      description: "Obtain and verify the current user's ID token.",
      isCode: true,
      question: {
        questionText:
          "Write Swift code to fetch `currentUser.getIDToken(completion:)` and print the token.",
      },
    },
    // 13
    {
      group: "5",
      title: "CRUD with Firestore",
      description: "Perform basic Firestore operations in Swift.",
      isCodeCompletion: true,
      question: {
        questionText:
          "Complete the Swift code to create, read, update, and delete a document in Firestore.",
        options: [
          // 1) Correct sequence and syntax
          `let db = Firestore.firestore()
let doc = db.collection("users").document("alice")
// create
doc.setData(["email": "alice@example.com", "age": 30])
// read
doc.getDocument { snapshot, error in
  let data = snapshot?.data()
}
// update
doc.updateData(["age": 31])
// delete
doc.delete()`,

          // 2) Mis-uses setData for update (overwrites entire document)
          `let db = Firestore.firestore()
let doc = db.collection("users").document("alice")
// create
doc.setData(["email": "alice@example.com", "age": 30])
// read
doc.getDocument { snapshot, error in
  let data = snapshot?.data()
}
// update
doc.setData(["age": 31])  // should use updateData
// delete
doc.delete()`,

          // 3) Incorrect read method and missing closure brace
          `let db = Firestore.firestore()
let doc = db.collection("users").document("alice")
// create
doc.setData(["email": "alice@example.com", "age": 30])
// read
doc.getDocuments { snapshot, error in
  let data = snapshot?.documents.first?.data()
// update
doc.updateData(["age": 31])
// delete
doc.delete()`,

          // 4) Wrong delete call on collection instead of document
          `let db = Firestore.firestore()
let doc = db.collection("users").document("alice")
// create
doc.setData(["email": "alice@example.com", "age": 30])
// read
doc.getDocument { snapshot, error in
  let data = snapshot?.data()
}
// update
doc.updateData(["age": 31])
// delete
db.collection("users").delete()  // invalid: must call delete() on document`,
        ],
        answer: `let db = Firestore.firestore()
let doc = db.collection("users").document("alice")
// create
doc.setData(["email": "alice@example.com", "age": 30])
// read
doc.getDocument { snapshot, error in
  let data = snapshot?.data()
}
// update
doc.updateData(["age": 31])
// delete
doc.delete()`,
      },
    },
    // 14
    {
      group: "5",
      title: "Calling Cloud Functions",
      description: "Invoke an HTTPS Callable Cloud Function from Swift.",
      isCode: true,
      question: {
        questionText:
          'Write Swift code to call `functions.httpsCallable("helloWorld").call()` and handle the result.',
      },
    },
    // 15
    {
      group: "5",
      title: "Local Emulation",
      description: "Learn how to test Firebase services locally.",
      isSingleLineText: true,
      question: {
        questionText: "What command starts the local Firebase emulator suite?",
        answer: "firebase emulators:start",
      },
    },
    // 16
    {
      group: "5",
      title: "Deploying to Firebase",
      description: "Deploy your Cloud Functions and Firestore rules.",
      isSingleLineText: true,
      question: {
        questionText: "What command do you use to deploy only Cloud Functions?",
        answer: "firebase deploy --only functions",
      },
    },
    // 17
    {
      group: "5",
      title: "Uploading to Storage",
      description: "Upload files to Firebase Storage in Swift.",
      isCode: true,
      question: {
        questionText:
          "Write Swift code using `Storage.storage().reference()` to upload `data` to `images/photo.jpg`.",
      },
    },
    // 18
    {
      group: "5",
      title: "Security Rules Basics",
      description: "Understand Firestore security rules for iOS clients.",
      isText: true,
      question: {
        questionText:
          "What are Firestore security rules and when are they evaluated on client requests?",
      },
    },
    // 19
    {
      group: "5",
      title: "Performance Monitoring",
      description: "Explore Firebase’s performance monitoring for iOS apps.",
      isText: true,
      question: {
        questionText:
          "Which Firebase product helps you monitor performance metrics in an iOS app?",
      },
    },
    // 20
    {
      group: "5",
      title: "Popular Firebase Extensions",
      description: "Learn about official Firebase Extensions you can install.",
      isMultipleAnswerChoice: true,
      question: {
        questionText:
          "Which of the following are Firebase Extensions you might add to your project?",
        options: [
          "Trigger Email via SendGrid",
          "Resize Images",
          "Translate Text",
          "Backup Realtime Database",
        ],
        answer: [
          "Trigger Email via SendGrid",
          "Resize Images",
          "Translate Text",
          "Backup Realtime Database",
        ],
      },
    },
    // 21
    {
      group: "5",
      title: "Review With AI Conversation (optional)",
      isConversationReview: true,
      description: "Review the subjects you've answered",
      question: {
        questionText: "Let's chat about the questions we've worked on so far.",
        range: [91, 110],
      },
    },
  ],

  ["android-en"]: [
    {
      group: "introduction",
      title: "Introduction To Android Development with Java",
      isStudyGuide: true,
      description:
        "Expose yourself to Java fundamentals and Android basics to improve the quality of your learning before making progress.",
      question: {
        questionText: (
          <div>
            <p style={{ marginBottom: 12 }}>
              One of the best predictors for student success is exposure to
              course material before studying it. You're encouraged to read
              about the fundamentals of Java and Android in this study guide
              before starting. You can reference this guide in the menu
              throughout your progress, too.
            </p>
            <p style={{ marginBottom: 12 }}>
              Remember to fail faster and fail forward! The real education
              happens when you push through a challenge. We'll start off nice
              and easy at first, then level up in difficulty as you collect more
              progress. Make sure to use the tools at your disposal—you’re going
              to need them.
            </p>
          </div>
        ),
        metaData: `### Advice
I know this looks like ChatGPT content…but it’s not—it's me!

As a beginner:
1. Programming is about structuring data and logic, not complex math.
2. Like spoken languages, you can express the same idea in many ways.
3. When something challenges you, break it into smaller steps and iterate quickly.

### Exposure
This guide exposes you to concepts before you answer questions, so you won’t be intimidated later. Skim it now, code along later.

### Core Concepts in Java

\`\`\`java
// Lists with ArrayList
import java.util.ArrayList;

ArrayList<Object> myList = new ArrayList<>();
myList.add(1);
myList.add(2);
myList.add(3);
myList.add("a");
myList.add(null);
myList.add(false);
myList.add("new data");
\`\`\`

\`\`\`java
// Maps with HashMap
import java.util.HashMap;

HashMap<String, Object> dataSet = new HashMap<>();
dataSet.put("introduction", "Welcome");
dataSet.put("title", "Chapter 1");
dataSet.put("isLive", true);
dataSet.put("page", 4);
dataSet.put("book", "Coding Basics");
\`\`\`

\`\`\`java
// Defining a class
public class House {
    private String housePaint;

    public House(String paint) {
        this.housePaint = paint;
    }

    public String getPaint() {
        return housePaint;
    }

    public void setPaint(String paint) {
        this.housePaint = paint;
    }

    public void deletePaint() {
        this.housePaint = null;
    }
}

// Usage:
// House firstHome = new House("pink");
// System.out.println(firstHome.getPaint()); // "pink"
\`\`\`

### Android UI Quick Preview

\`\`\`java
// MainActivity.java
package com.example.introapp;

import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;
import android.widget.TextView;

public class MainActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        TextView tv = new TextView(this);
        tv.setText("Good job! You created a small Android app!");
        tv.setTextSize(24);
        setContentView(tv);
    }
}
\`\`\`

### Conclusion
Failing fast is in your best interest when learning a new language. This one-pager will be available inside the app. Good luck, and happy coding in Java & Android!`,
      },
    },
    {
      group: "tutorial",
      title: "Understanding Coding",
      description: "Grasp the basic concept of coding in Java.",
      isMultipleChoice: true,
      question: {
        questionText: "Which of the following best describes coding?",
        options: [
          "Writing instructions for computers to perform tasks",
          "Creating physical components for computers",
          "Designing user interfaces",
          "Managing databases",
        ],
        answer: "Writing instructions for computers to perform tasks",
      },
    },
    {
      group: "tutorial",
      title: "Sequence of Program Execution",
      description: "Learn the correct order of program execution in Java.",
      isSelectOrder: true,
      question: {
        questionText:
          "Arrange the steps with drag-and-drop to order how a Java program is built and run.",
        options: [
          "Writing Code",
          "Code Compilation",
          "Debugging",
          "Program Execution",
        ],
        answer: [
          "Writing Code",
          "Code Compilation",
          "Debugging",
          "Program Execution",
        ],
      },
    },
    {
      group: "tutorial",
      title: "Introduction to Variables",
      description:
        "In this step, you will learn about declaring variables in Java.",
      isMultipleAnswerChoice: true,
      question: {
        questionText:
          "Select all the steps involved in correctly declaring a variable in Java:",
        options: [
          "Specify a type (e.g., int, String)",
          "Choose a descriptive variable name",
          "Assign a value using the equals sign (=)",
          "End the declaration with a semicolon (;)",
          "Start the name with a number",
          "Use uppercase letters for all variable names",
        ],
        answer: [
          "Specify a type (e.g., int, String)",
          "Choose a descriptive variable name",
          "Assign a value using the equals sign (=)",
          "End the declaration with a semicolon (;)",
        ],
      },
    },
    {
      group: "tutorial",
      title: "Understanding List Declarations",
      description:
        "Complete the code by selecting the correct way to declare a list of items in Java.",
      isCodeCompletion: true,
      question: {
        questionText:
          "Which code block correctly declares a list of items in Java?",
        options: [
          `String[] items = {"apple", "banana", "cherry"};`,
          `List<String> items = Arrays.asList("apple", "banana", "cherry");`,
          `String items = "apple, banana, cherry";`,
          `Map<String, Integer> items = Map.of("apple", 1, "banana", 2, "cherry", 3);`,
          `class Items { /* ... */ }`,
        ],
        answer: `String[] items = {"apple", "banana", "cherry"};`,
      },
    },
    {
      group: "tutorial",
      title: "Variable Assignment in Java",
      description: "Learn how to assign values to variables in Java.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Declare a variable named `age` and assign it the value 25.",
      },
    },
    {
      group: "tutorial",
      title: "Understanding Data Types",
      description: "Learn the basics of data types in Java.",
      isSingleLineText: true,
      question: {
        questionText: "Which keyword is used to declare a constant in Java?",
        placeholder: "Type your answer here...",
        answer: "final",
      },
    },
    {
      group: "tutorial",
      title: "Purpose of Variables",
      description: "Understand why variables are used in programming.",
      isText: true,
      question: {
        questionText:
          "In your own words, explain the purpose of variables in programming.",
      },
    },
    {
      group: "tutorial",
      title: "Bash Terminal Practice: Changing Directories",
      description: "Practice changing directories in a terminal environment.",
      isCode: true,
      isTerminal: true,
      question: {
        questionText:
          "Enter the command to change to the `new_folder` directory using a Bash terminal.",
      },
    },
    {
      group: "tutorial",
      title: "Review With AI Conversation (optional)",
      isConversationReview: true,
      description: "Review the subjects you've answered",
      question: {
        questionText: "Let's chat about the questions we've worked on so far.",
        range: [1, 8],
      },
    },

    // 1
    {
      group: "1",
      title: "Data Types in Programming",
      description: "Identify different primitive data types used in Java.",
      isMultipleAnswerChoice: true,
      question: {
        questionText:
          "Which of the following are primitive data types in Java?",
        options: [
          "byte",
          "short",
          "int",
          "long",
          "float",
          "double",
          "boolean",
          "char",
        ],
        answer: [
          "byte",
          "short",
          "int",
          "long",
          "float",
          "double",
          "boolean",
          "char",
        ],
      },
    },
    // 2
    {
      group: "1",
      title: "Steps to Create a Function",
      description: "Understand the sequence of creating and using a method.",
      isSelectOrder: true,
      question: {
        questionText:
          "Arrange the steps with drag-and-drop to create and use a Java method.",
        options: [
          "Define the method",
          "Call the method",
          "Execute the method body",
          "Return a value",
        ],
        answer: [
          "Define the method",
          "Call the method",
          "Execute the method body",
          "Return a value",
        ],
      },
    },
    // 3
    {
      group: "1",
      title: "Writing a Simple Function",
      description: "Practice writing methods in Java.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Write a static method named `greet` that takes a `String name` parameter and prints a greeting with that name.",
      },
    },
    // 4
    {
      group: "1",
      title: "Functions in Programming",
      description: "Discuss the role of methods.",
      isText: true,
      question: {
        questionText: "What is a method, and why is it useful in programming?",
      },
    },
    // 5
    {
      group: "1",
      title: "Conditional Statements",
      description: "Identify the purpose of conditional statements.",
      isMultipleChoice: true,
      question: {
        questionText: "What is the primary purpose of an `if` statement?",
        options: [
          "To repeat a block of code multiple times",
          "To execute a block of code based on a condition",
          "To define a variable",
          "To import external libraries",
        ],
        answer: "To execute a block of code based on a condition",
      },
    },
    // 6
    {
      group: "1",
      title: "Order of Conditional Checks",
      description:
        "Complete the code that evaluates an `if`/`else if`/`else` statement.",
      isCodeCompletion: true,
      question: {
        questionText:
          "Complete the following code to check if `x` is greater than 10, equal to 10, or less than 10.",
        options: [
          // 1) Correct logic and operators
          `if (x > 10) {
    System.out.println("x is greater than 10");
} else if (x == 10) {
    System.out.println("x is equal to 10");
} else {
    System.out.println("x is less than 10");
}`,

          // 2) Swapped first two checks (wrong logic order)
          `if (x == 10) {
    System.out.println("x is equal to 10");
} else if (x > 10) {
    System.out.println("x is greater than 10");
} else {
    System.out.println("x is less than 10");
}`,

          // 3) Missing the else-if branch entirely
          `if (x > 10) {
    System.out.println("x is greater than 10");
} else {
    System.out.println("x is not greater than 10");
}`,

          // 4) Used >= for the second check (treats 10 as greater-than)
          `if (x > 10) {
    System.out.println("x is greater than 10");
} else if (x >= 10) {
    System.out.println("x is equal to 10");
} else {
    System.out.println("x is less than 10");
}`,
        ],
        answer: `if (x > 10) {
    System.out.println("x is greater than 10");
} else if (x == 10) {
    System.out.println("x is equal to 10");
} else {
    System.out.println("x is less than 10");
}`,
      },
    },
    // 7
    {
      group: "1",
      title: "Implementing Conditional Logic",
      description: "Apply conditional logic in code.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Write an `if`/`else if`/`else` statement that checks if a number `num` is positive, negative, or zero, and prints an appropriate message.",
      },
    },
    // 8
    {
      group: "1",
      title: "Understanding Conditional Logic in Programming",
      description:
        "Learn how logical operators like AND and OR control conditions in programming.",
      isSingleLineText: true,
      question: {
        questionText:
          "Which logical operator is used to check if both conditions in a conditional statement are true in Java?",
        placeholder: "Type your answer here...",
        answer: "&&",
      },
    },
    // 9
    {
      group: "1",
      title: "Real-world Use of Conditionals",
      description: "Reflect on how conditionals are used.",
      isText: true,
      question: {
        questionText:
          "Provide an example of how conditional statements are used in real-world applications.",
      },
    },
    // 10
    {
      group: "1",
      title: "Terminal Practice: Help Command",
      description: "Write the help command to observe basic commands.",
      isCode: true,
      isTerminal: true,
      question: {
        questionText:
          "In a Bash terminal environment, enter the help command to discover basic commands.",
      },
    },
    // 11
    {
      group: "1",
      title: "Loops in Programming",
      description: "Understand the purpose of loops.",
      isMultipleChoice: true,
      question: {
        questionText:
          "Which loop will continue executing as long as its condition remains true in Java?",
        options: ["for loop", "while loop", "do...while loop", "foreach loop"],
        answer: "while loop",
      },
    },
    // 12
    {
      group: "1",
      title: "Sequence of Loop Execution",
      description: "Grasp the order in which loops execute.",
      isSelectOrder: true,
      question: {
        questionText:
          "Arrange the steps of a Java `for` loop execution with drag-and-drop.",
        options: [
          "Initialization",
          "Condition Check",
          "Execution of Code Block",
          "Update Expression",
        ],
        answer: [
          "Initialization",
          "Condition Check",
          "Execution of Code Block",
          "Update Expression",
        ],
      },
    },
    // 13
    {
      group: "1",
      title: "Creating a Loop",
      description: "Practice writing loops.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText: "Write a `for` loop that prints numbers from 1 to 5.",
      },
    },
    // 14
    {
      group: "1",
      title: "Applications of Loops",
      description: "Discuss where loops are useful.",
      isText: true,
      question: {
        questionText:
          "Describe a scenario in software development where loops are essential.",
      },
    },
    // 15
    {
      group: "1",
      title: "Arrays in Java",
      description: "Identify methods used for manipulating arrays in Java.",
      isMultipleAnswerChoice: true,
      question: {
        questionText:
          "Which of the following are valid for manipulating arrays in Java?",
        options: [
          ".length",
          "Arrays.sort()",
          "Arrays.asList()",
          "System.arraycopy()",
          ".clone()",
        ],
        answer: [
          "Arrays.sort()",
          "Arrays.asList()",
          "System.arraycopy()",
          ".clone()",
        ],
      },
    },
    // 16
    {
      group: "1",
      title: "Order of Array Operations",
      description: "Understand how array operations are performed.",
      isCodeCompletion: true,
      question: {
        questionText:
          "Complete the code to declare an array, add an element, remove the last element, and then access an element.",
        options: [
          // 1) Correct sequence
          `List<String> fruits = new ArrayList<>(Arrays.asList("apple", "banana"));
fruits.add("pink");
fruits.remove(fruits.size() - 1);
System.out.println(fruits.get(0));`,

          // 2) Missing the removal step
          `List<String> fruits = new ArrayList<>(Arrays.asList("apple", "banana"));
fruits.add("pink");
System.out.println(fruits.get(0));`,

          // 3) Removed the first element instead of the last
          `List<String> fruits = new ArrayList<>(Arrays.asList("apple", "banana"));
fruits.add("pink");
fruits.remove(0);
System.out.println(fruits.get(0));`,

          // 4) Accessing the wrong index after removal
          `List<String> fruits = new ArrayList<>(Arrays.asList("apple", "banana"));
fruits.add("pink");
fruits.remove(fruits.size() - 1);
System.out.println(fruits.get(1));`,

          // 5) Operations in the wrong order (remove before add)
          `List<String> fruits = new ArrayList<>(Arrays.asList("apple", "banana"));
fruits.remove(fruits.size() - 1);
fruits.add("pink");
System.out.println(fruits.get(0));`,
        ],
        answer: `List<String> fruits = new ArrayList<>(Arrays.asList("apple", "banana"));
fruits.add("pink");
fruits.remove(fruits.size() - 1);
System.out.println(fruits.get(0));`,
      },
    },
    // 17
    {
      group: "1",
      title: "Manipulating Arrays",
      description: "Apply array operations in code.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          'Create an ArrayList `fruits` with "apple" and "banana". Add "pink" to the list and remove the first element.',
      },
    },
    // 18
    {
      group: "1",
      title: "Use Cases for Arrays",
      description: "Explore scenarios where arrays are used.",
      isText: true,
      question: {
        questionText:
          "Provide an example of how an array can be used to manage data in an Android application.",
      },
    },
    // 19
    {
      group: "1",
      title: "Terminal Practice: Creating Directories",
      description: "Creating a directory command in a bash terminal",
      isCode: true,
      isTerminal: true,
      question: {
        questionText:
          "In a Bash terminal environment, create a directory called `app` using the `mkdir` command.",
      },
    },
    // 20
    {
      group: "1",
      title: "Advanced Coding Output",
      description:
        "Predict the output of the following code with arrays, conditionals, logical operators, and streams.",
      isSingleLineText: true,
      question: {
        questionText: (
          <div>
            What will be the output of the following code?
            <br />
            <pre>
              {`
List<Integer> arr = new ArrayList<>(Arrays.asList(1, 2, 3, 4));
int x = 10;
int y = 5;

if (x > y && arr.size() > 3) {
    arr.add(x);
    arr = arr.stream().filter(n -> n % 2 == 0).collect(Collectors.toList());
}

System.out.println(arr);
`}
            </pre>
          </div>
        ),
        placeholder: "Type your answer here...",
        answer: "[2, 4, 10]",
      },
    },
    // 21
    {
      group: "1",
      title: "Review With AI Conversation (optional)",
      isConversationReview: true,
      description: "Review the subjects you've answered",
      question: {
        questionText: "Let's chat about the questions we've worked on so far.",
        range: [10, 29],
      },
    },
    // 1
    {
      group: "2",
      title: "Introduction to Objects",
      description:
        "In this step, you will learn what an object is in programming.",
      isSingleLineText: true,
      question: {
        questionText:
          "Which keyword is used to create a new object instance in Java?",
        placeholder: "Type your answer here...",
        answer: "new",
      },
    },
    // 2
    {
      group: "2",
      title: "Understanding the Constructor Method",
      description:
        "In this step, you will learn about the purpose of the constructor method in a class.",
      isCodeCompletion: true,
      question: {
        questionText:
          "Which of the following code blocks correctly defines the constructor method and instantiates the class in Java?",
        options: [
          `public class Car {
    private String brand;
    public Car(String brand) {
      this.brand = brand;
    }
    public void drive() {
      System.out.println("The car is driving");
    }
}
Car myCar = new Car("Toyota");`,
          `public class Car {
    private String brand;
    public Car() {
      this.brand = "Toyota";
    }
    public void drive() {
      System.out.println("The car is driving");
    }
}
Car myCar = new Car();`,
          `public class Car {
    private String brand;
    public void Car(String brand) {
      this.brand = brand;
    }
    public void drive() {
      System.out.println("The car is driving");
    }
}
Car myCar = new Car("Toyota");`,
          `public class Car {
    private String brand;
    public Car(String b) {
      brand = b;
    }
    public void drive() {
      System.out.println("The car is driving");
    }
}
Car myCar = new Car("Toyota");`,
        ],
        answer: `public class Car {
    private String brand;
    public Car(String brand) {
      this.brand = brand;
    }
    public void drive() {
      System.out.println("The car is driving");
    }
}
Car myCar = new Car("Toyota");`,
      },
    },
    // 3
    {
      group: "2",
      title: "Purpose of the Constructor Method",
      description:
        "In this step, you will learn about the purpose of the constructor method in a class.",
      isText: true,
      question: {
        questionText:
          "Explain the purpose of the constructor method in a class.",
      },
    },
    // 4
    {
      group: "2",
      title: "Creating an Instance of a Class",
      description:
        "In this step, you will learn how to create an instance of a class in Java.",
      isMultipleAnswerChoice: true,
      question: {
        questionText:
          "Select all the correct steps required to create an instance of a class in Java:",
        options: [
          "Define the class using the `class` keyword",
          "Use the `new` keyword to create an instance",
          "Pass arguments required by the constructor when calling the class",
          "Store the new instance in a variable",
          "Declare the class instance without `new`",
          "Instantiate the class before defining it",
        ],
        answer: [
          "Define the class using the `class` keyword",
          "Use the `new` keyword to create an instance",
          "Pass arguments required by the constructor when calling the class",
          "Store the new instance in a variable",
        ],
      },
    },
    // 5
    {
      group: "2",
      title: "Declaring a Method in a Class",
      description:
        "In this step, you will learn how to declare a method inside a class.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Declare a method named `updateModel` in the `Car` class that updates the `model` property.",
      },
    },
    // 6
    {
      group: "2",
      title: "Using the this Keyword",
      description:
        "Complete the code by selecting the correct way to use the `this` keyword in a class method.",
      isCodeCompletion: true,
      question: {
        questionText:
          "Which code block correctly uses the `this` keyword to refer to the object's property?",
        options: [
          `public class Car {
    private String brand;
    public Car(String brand) { this.brand = brand; }
    public void showBrand() { System.out.println(brand); }
}
Car myCar = new Car("Toyota");
myCar.showBrand();`,
          `public class Car {
    private String brand;
    public Car(String brand) { this.brand = brand; }
    public void showBrand() { System.out.println(this.brand); }
}
Car myCar = new Car("Toyota");
myCar.showBrand();`,
          `public class Car {
    private String brand;
    public Car(String brand) { brand = this.brand; }
    public void showBrand() { System.out.println(brand); }
}
Car myCar = new Car("Toyota");
myCar.showBrand();`,
          `public class Car {
    private String brand;
    public Car(String brand) { this.brand = brand; }
    public void showBrand() { System.out.println(this.brand()); }
}
Car myCar = new Car("Toyota");
myCar.showBrand();`,
        ],
        answer: `public class Car {
    private String brand;
    public Car(String brand) { this.brand = brand; }
    public void showBrand() { System.out.println(this.brand); }
}
Car myCar = new Car("Toyota");
myCar.showBrand();`,
      },
    },
    // 7
    {
      group: "2",
      title: "Adding Properties to an Object",
      description:
        "In this step, you will learn how to add properties to a class in Java.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Add a new property `private int year;` to the `Car` class.",
      },
    },
    // 8
    {
      group: "2",
      title: "Accessing and Modifying Object Properties",
      description:
        "In this step, you will learn how to get or set properties of an object in Java.",
      isMultipleAnswerChoice: true,
      question: {
        questionText:
          "Which of the following are valid ways to get or set properties in Java?",
        options: [
          "Use a getter method (e.g., getModel())",
          "Use a setter method (e.g., setModel())",
          "Access a public field directly (e.g., obj.model)",
          "Use reflection APIs",
        ],
        answer: [
          "Use a getter method (e.g., getModel())",
          "Use a setter method (e.g., setModel())",
          "Access a public field directly (e.g., obj.model)",
        ],
      },
    },
    // 9
    {
      group: "2",
      title: "Modifying Object Properties",
      description:
        "In this step, you will learn how to modify properties of an object in Java.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Modify the `model` property of an instance of the `Car` class.",
      },
    },
    // 10
    {
      group: "2",
      title: "Understanding Inheritance",
      description:
        "In this step, you will learn about inheritance in object-oriented programming.",
      isText: true,
      question: {
        questionText: "What is inheritance in object-oriented programming?",
      },
    },
    // 11
    {
      group: "2",
      title: "Implementing Inheritance",
      description:
        "In this step, you will implement inheritance in Java by extending a class.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Extend the `Car` class to create an `ElectricCar` class with an additional property `private int batteryLife;`.",
      },
    },
    // 12
    {
      group: "2",
      title: "Overriding Methods",
      description:
        "In this step, you will learn how to override methods in a subclass.",
      isMultipleChoice: true,
      question: {
        questionText: "What does it mean to override a method in a subclass?",
        options: [
          "Provide a new implementation for a superclass method",
          "Delete the superclass method",
          "Inherit the method without changes",
          "Call the superclass method via super.method()",
        ],
        answer: "Provide a new implementation for a superclass method",
      },
    },
    // 13
    {
      group: "2",
      title: "Understanding Encapsulation",
      description:
        "In this step, you will learn about encapsulation in object-oriented programming.",
      isText: true,
      question: {
        questionText: "What is encapsulation in object-oriented programming?",
      },
    },
    // 14
    {
      group: "2",
      title: "Implementing Encapsulation",
      description:
        "In this step, you will implement encapsulation by using getter and setter methods.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Add getter and setter methods for the `batteryLife` property in the `ElectricCar` class.",
      },
    },
    // 15
    {
      group: "2",
      title: "Encapsulation Concept",
      description:
        "In this step, you will define the concept of encapsulation in one word.",
      isSingleLineText: true,
      question: {
        questionText:
          "What is the primary concept encapsulation ensures in object-oriented programming?",
        placeholder: "Type your answer here...",
        answer: "Privacy",
      },
    },
    // 16
    {
      group: "2",
      title: "Combining Concepts",
      description:
        "In this step, you will combine various concepts learned to create a small project.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Create a small project that defines a `Person` class, uses inheritance to create a `Student` class, and demonstrates encapsulation and arrays of objects.",
      },
    },
    // 17
    {
      group: "2",
      title: "Printing In The Terminal",
      description: "In this step, you will print a message using the terminal",
      isCode: true,
      isTerminal: true,
      question: {
        questionText:
          "Type a command to print the message: 'I'm talking to the inside of a computer!'",
      },
    },
    // 18
    {
      group: "2",
      title: "Review With AI Conversation (optional)",
      isConversationReview: true,
      description: "Review the subjects you've answered",
      question: {
        questionText: "Let's chat about the questions we've worked on so far.",
        range: [31, 47],
      },
    },
    // 1
    {
      group: "3",
      title: "Introduction to Android Views",
      description:
        "In this step, you will learn about Android Views, their role in creating reusable UI elements, and how they help manage the user interface efficiently.",
      isMultipleChoice: true,
      question: {
        questionText: "Which of the following best describes an Android View?",
        options: [
          "A method for handling events in Java",
          "A feature exclusive to background services",
          "A reusable piece of user interface defined by the View class or its subclasses",
          "A built-in XML element that only represents layouts",
        ],
        answer:
          "A reusable piece of user interface defined by the View class or its subclasses",
      },
    },
    // 2
    {
      group: "3",
      title: "Key Concepts in Android UI",
      description:
        "In this step, you will learn about fundamental Android UI concepts, including Activities, Fragments, XML layouts, and event handling.",
      isMultipleAnswerChoice: true,
      question: {
        questionText: "Which of the following are key concepts in Android UI?",
        options: [
          "Activities as screen controllers",
          "Directly manipulating the window manager for animations",
          "Fragments for modular UI",
          "XML layouts for defining view hierarchies",
          "Using TextView for data binding",
        ],
        answer: [
          "Activities as screen controllers",
          "Fragments for modular UI",
          "XML layouts for defining view hierarchies",
        ],
      },
    },
    // 3
    {
      group: "3",
      title: "Effect of LiveData Changes on UI",
      description:
        "In this step, you will explain what happens to an Activity or Fragment when its LiveData updates.",
      isText: true,
      question: {
        questionText:
          "What happens to the UI when observed LiveData in a ViewModel changes?",
      },
    },
    // 4
    {
      group: "3",
      title: "Creating a Simple Activity",
      description:
        "In this step, you will define a basic Android Activity that sets a TextView in onCreate.",
      isCodeCompletion: true,
      question: {
        questionText:
          "Which of the following code blocks correctly defines a simple Activity that sets its content view and updates a TextView?",
        options: [
          `public class MainActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        TextView tv = new TextView(this);
        tv.setText("Hello, Android!");
        setContentView(tv);
    }
}`,
          `public class MainActivity {
    protected void onCreate() {
        setContentView(R.layout.activity_main);
    }
}`,
          `class MainActivity extends Activity {
    void onCreate(Bundle s) {
        super.onCreate(s);
    }
}`,
          `public class MainActivity extends AppCompatActivity {
    void onStart() {
        TextView tv = findViewById(R.id.tv);
        tv.setText("Hello, Android!");
    }
}`,
        ],
        answer: `public class MainActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        TextView tv = new TextView(this);
        tv.setText("Hello, Android!");
        setContentView(tv);
    }
}`,
      },
    },
    // 5
    {
      group: "3",
      title: "Handling Button Clicks",
      description:
        "In this step, you will define a basic Activity that handles a button click event using setOnClickListener.",
      isCodeCompletion: true,
      question: {
        questionText:
          "Which of the following code blocks correctly sets a click listener on a Button?",
        options: [
          `Button btn = findViewById(R.id.btn);
btn.setOnClickListener(new View.OnClickListener() {
    @Override
    public void onClick(View v) {
        Toast.makeText(this, "Clicked!", Toast.LENGTH_SHORT).show();
    }
});`,
          `Button btn = findViewById(R.id.btn);
btn.setOnClickListener(v -> {
    Toast.makeText(MainActivity.this, "Clicked!", Toast.LENGTH_SHORT).show();
});`,
          `Button btn = findViewById(R.id.btn);
btn.onClick(() -> Toast.makeText(this, "Clicked!", Toast.LENGTH_SHORT).show());`,
          `findViewById(R.id.btn).setClickListener(this);`,
        ],
        answer: `Button btn = findViewById(R.id.btn);
btn.setOnClickListener(v -> {
    Toast.makeText(MainActivity.this, "Clicked!", Toast.LENGTH_SHORT).show();
});`,
      },
    },
    // 6
    {
      group: "3",
      title: "Managing State with ViewModel",
      description:
        "In this step, you will learn how to use ViewModel and LiveData to manage UI-related data.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Modify your Activity to use a ViewModel with LiveData<Boolean> liked and observe it to update the UI.",
      },
    },
    // 7
    {
      group: "3",
      title: "Intent Extras",
      description:
        "In this step, you will learn about passing data between Activities using Intent extras.",
      isSingleLineText: true,
      question: {
        questionText:
          "What is the term used for passing data into an Activity at launch?",
        placeholder: "Type your answer here...",
        answer: "Intent extras",
      },
    },
    // 8
    {
      group: "3",
      title: "Passing and Using Extras",
      description:
        "In this step, you will learn how to pass and retrieve extras in an Activity.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          'Update your Activity to read a String extra named "username" from the Intent and display it.',
      },
    },
    // 9
    {
      group: "3",
      title: "Props vs State in Android",
      description:
        "In this step, you will learn the difference between Intent extras and LiveData state.",
      isMultipleChoice: true,
      question: {
        questionText:
          "What is the main difference between Intent extras and LiveData in an Android app?",
        options: [
          "Extras are immutable once set, LiveData can update over time",
          "LiveData is only for background tasks",
          "Extras trigger UI updates automatically",
          "LiveData cannot be observed from Fragments",
        ],
        answer: "Extras are immutable once set, LiveData can update over time",
      },
    },
    // 10
    {
      group: "3",
      title: "Terminal Practice: Listing Files",
      description:
        "In this step, you will learn how to list files in a bash terminal.",
      isCode: true,
      isTerminal: true,
      question: {
        questionText:
          "Use the terminal to list all files using the `ls` command.",
      },
    },
    // 11
    {
      group: "3",
      title: "Styling Android Views",
      description:
        "In this step, you will learn how to style Views using XML attributes and programmatic methods.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Add XML attributes to a TextView to set textSize, textColor, padding, and background.",
      },
    },
    // 12
    {
      group: "3",
      title: "ConstraintLayout Basics",
      description:
        "In this step, you will learn how to use ConstraintLayout for positioning UI elements.",
      isSelectOrder: true,
      question: {
        questionText:
          "Arrange the following steps to constrain a Button to the center of its parent:",
        options: [
          'app:layout_constraintTop_toTopOf="parent"',
          'app:layout_constraintBottom_toBottomOf="parent"',
          'app:layout_constraintStart_toStartOf="parent"',
          'app:layout_constraintEnd_toEndOf="parent"',
        ],
        answer: [
          'app:layout_constraintTop_toTopOf="parent"',
          'app:layout_constraintBottom_toBottomOf="parent"',
          'app:layout_constraintStart_toStartOf="parent"',
          'app:layout_constraintEnd_toEndOf="parent"',
        ],
      },
    },
    // 13
    {
      group: "3",
      title: "Sharing ViewModel Between Fragments",
      description:
        "In this step, you will learn how to share state via a ViewModel between Fragments.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Create a shared ViewModel in your Activity and have two Fragments observe its LiveData.",
      },
    },
    // 14
    {
      group: "3",
      title: "Observing LiveData for Side Effects",
      description:
        "In this step, you will learn how to observe LiveData to handle side effects in the UI.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Modify your Fragment to observe a LiveData<Int> retweetCount and show a Toast whenever it changes.",
      },
    },
    // 15
    {
      group: "3",
      title: "Understanding Activity Lifecycle",
      description:
        "In this step, you will learn about the Android Activity lifecycle and its callback methods.",
      isText: true,
      question: {
        questionText:
          "What are the main callbacks in the Activity lifecycle and when is onResume called?",
      },
    },
    // 16
    {
      group: "3",
      title: "Fetching Data with Retrofit and LiveData",
      description:
        "In this step, you will learn how to fetch data from an API using Retrofit and expose it via LiveData.",
      isSelectOrder: true,
      question: {
        questionText:
          "Arrange the steps to correctly fetch tweets using Retrofit and LiveData:",
        options: [
          "Define a Retrofit interface",
          "Create a Repository to call Retrofit",
          "Expose results as LiveData in ViewModel",
          "Observe LiveData in UI",
          "Handle errors in the Repository",
        ],
        answer: [
          "Define a Retrofit interface",
          "Create a Repository to call Retrofit",
          "Expose results as LiveData in ViewModel",
          "Handle errors in the Repository",
          "Observe LiveData in UI",
        ],
      },
    },
    // 17
    {
      group: "3",
      title: "Building a Complete Tweet App",
      description:
        "In this step, you will combine everything you have learned to build a complete Tweet app on Android.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Build an Android Tweet app with Retrofit, ViewModel, LiveData, and RecyclerView allowing users to like and retweet.",
      },
    },
    // 18
    {
      group: "3",
      title: "Terminal Practice: Building with Gradle",
      description:
        "In this step, you will learn how to build your Android project using the terminal.",
      isText: true,
      question: {
        questionText:
          "Enter the command to build your project using Gradle: `./gradlew build`.",
      },
    },
    // 19
    {
      group: "3",
      title: "Creating a New Android Project",
      description:
        "In this step, you will learn how to create a new Android project in Android Studio.",
      isSelectOrder: true,
      question: {
        questionText:
          "Arrange the steps to create a new Android app in Android Studio:",
        options: [
          "Open Android Studio and select New Project",
          "Choose Empty Activity template",
          "Select Java as the language",
          "Enter application name and package",
          "Click Finish to generate project",
        ],
        answer: [
          "Open Android Studio and select New Project",
          "Choose Empty Activity template",
          "Select Java as the language",
          "Enter application name and package",
          "Click Finish to generate project",
        ],
      },
    },
    // 20
    {
      group: "3",
      title: "Review With AI Conversation (optional)",
      isConversationReview: true,
      description: "Review the subjects you've answered",
      question: {
        questionText: "Let's chat about the questions we've worked on so far.",
        range: [49, 67],
      },
    },
    // 1
    {
      group: "4",
      title: "Introduction to Java Backend Engineering with Spring Boot",
      description:
        "In this step, you will learn what backend software engineering is and why it is important.",
      isText: true,
      question: {
        questionText:
          "What is backend software engineering and why is it important in building applications?",
      },
    },
    // 2
    {
      group: "4",
      title: "Main Lessons Overview",
      description:
        "In this step, you will identify a core responsibility of backend engineering in Java.",
      isMultipleChoice: true,
      question: {
        questionText:
          "Which of the following is a core responsibility in backend engineering?",
        options: [
          "Managing concurrency and ensuring thread safety in multi-user applications",
          "Implementing user authentication directly in the user interface",
          "Handling memory allocation in the Java Virtual Machine",
          "Designing scalable UI components for cross-platform compatibility",
          "Optimizing database queries and ensuring data consistency",
        ],
        answer: "Optimizing database queries and ensuring data consistency",
      },
    },
    // 3
    {
      group: "4",
      title: "Key Responsibilities of Backend Engineering",
      description:
        "In this step, you will learn about the various responsibilities involved in Java backend engineering with Spring Boot.",
      isMultipleAnswerChoice: true,
      question: {
        questionText:
          "Which of the following are core responsibilities of backend engineering?",
        options: [
          "Managing and optimizing databases for storing and retrieving data efficiently",
          "Designing and implementing RESTful APIs using Spring MVC",
          "Ensuring security through user authentication and authorization mechanisms",
          "Handling server-side logic, including business operations and calculations",
          "Maintaining server reliability and performance under high traffic",
          "Managing data integrity and consistency across distributed systems",
          "Implementing logging and monitoring to ensure system health and debug issues",
        ],
        answer: [
          "Managing and optimizing databases for storing and retrieving data efficiently",
          "Designing and implementing RESTful APIs using Spring MVC",
          "Ensuring security through user authentication and authorization mechanisms",
          "Handling server-side logic, including business operations and calculations",
          "Maintaining server reliability and performance under high traffic",
          "Managing data integrity and consistency across distributed systems",
          "Implementing logging and monitoring to ensure system health and debug issues",
        ],
      },
    },
    // 4
    {
      group: "4",
      title: "Interfacing with the Terminal",
      description:
        "In this step, you will learn about using the terminal in Java backend engineering.",
      isText: true,
      question: {
        questionText:
          "Why is learning to use the terminal important for backend development, and what kinds of tasks can you perform using it?",
      },
    },
    // 5
    {
      group: "4",
      title: "Installing Maven",
      description:
        "In this step, you will learn how to install Maven globally.",
      isText: true,
      question: {
        questionText:
          "Write the command to install Apache Maven using Homebrew or apt.",
      },
    },
    // 6
    {
      group: "4",
      title: "Adding a Maven Dependency",
      description: "In this step, you will use Maven to add a dependency.",
      isText: true,
      question: {
        questionText:
          "Write the XML snippet to add the Spring Web starter dependency in pom.xml.",
      },
    },
    // 7
    {
      group: "4",
      title: "User Creation and Authentication",
      description:
        "In this step, you will understand the key concept related to creating users in backend systems.",
      isSingleLineText: true,
      question: {
        questionText:
          "What is the process called that verifies a user's identity during account creation?",
        placeholder: "Type your answer here...",
        answer: "authentication",
      },
    },
    // 8
    {
      group: "4",
      title: "Database Foundations",
      description:
        "In this step, you will learn about the foundations of databases in backend engineering.",
      isText: true,
      question: {
        questionText:
          "What are the main types of databases used in backend engineering?",
      },
    },
    // 9
    {
      group: "4",
      title: "Connecting to a Database with Spring Data JPA",
      description:
        "Write a code snippet to connect a Spring Boot application to a PostgreSQL database.",
      isCode: true,
      question: {
        questionText:
          "Write a Java code snippet (application.properties and Entity configuration) to configure Spring Data JPA with PostgreSQL.",
      },
    },
    // 10
    {
      group: "4",
      title: "Initiating a Spring Boot Project",
      description:
        "In this step, you will learn how to start a Spring Boot project using the CLI.",
      isSingleLineText: true,
      question: {
        questionText:
          "What is the command to create a new Spring Boot project using Spring Initializr CLI?",
        answer: "spring init --dependencies=web,data-jpa,postgresql my-app",
      },
    },
    // 11
    {
      group: "4",
      title: "Advanced Data Storage Practices",
      description:
        "In this step, you will learn advanced practices for storing data responsibly in backend systems.",
      isMultipleAnswerChoice: true,
      question: {
        questionText:
          "Which of the following are best practices for ensuring responsible data storage in a backend system?",
        options: [
          "Cache data in memory (e.g., with Redis) to reduce database access time",
          "Use a single centralized backup to reduce complexity and cost",
          "Encrypt sensitive data both at rest and in transit to ensure security",
          "Implement database replication across multiple servers to improve fault tolerance",
        ],
        answer: [
          "Cache data in memory (e.g., with Redis) to reduce database access time",
          "Encrypt sensitive data both at rest and in transit to ensure security",
          "Implement database replication across multiple servers to improve fault tolerance",
        ],
      },
    },
    // 12
    {
      group: "4",
      title: "Configuring JPA and Saving an Entity",
      description:
        "In this step, you will learn how to initialize Spring Data JPA and save a User entity.",
      isCodeCompletion: true,
      question: {
        questionText:
          "Complete the code to configure Spring Data JPA and save a User entity.",
        options: [
          // 1) Correct configuration with JPA annotations and repository usage
          `@Entity
public class User {
    @Id @GeneratedValue
    private Long id;
    private String username;
    // getters/setters
}

@Repository
public interface UserRepository extends JpaRepository<User, Long> {}

@Service
public class UserService {
    @Autowired
    private UserRepository repo;

    public void addUser(String name) {
        User u = new User();
        u.setUsername(name);
        repo.save(u);
    }
}`,

          // 2) Missing @GeneratedValue, so IDs won’t be auto-generated
          `@Entity
public class User {
    @Id
    private Long id;            // @GeneratedValue omitted
    private String username;
    // getters/setters
}

@Repository
public interface UserRepository extends JpaRepository<User, Long> {}

@Service
public class UserService {
    @Autowired
    private UserRepository repo;

    public void addUser(String name) {
        User u = new User();
        u.setUsername(name);
        repo.save(u);
    }
}`,

          // 3) Repository extends CrudRepository instead of JpaRepository
          `@Entity
public class User {
    @Id @GeneratedValue
    private Long id;
    private String username;
    // getters/setters
}

@Repository
public interface UserRepository extends CrudRepository<User, Long> {}  // wrong interface

@Service
public class UserService {
    @Autowired
    private UserRepository repo;

    public void addUser(String name) {
        User u = new User();
        u.setUsername(name);
        repo.save(u);
    }
}`,

          // 4) Service missing @Autowired injection, so repo is null
          `@Entity
public class User {
    @Id @GeneratedValue
    private Long id;
    private String username;
    // getters/setters
}

@Repository
public interface UserRepository extends JpaRepository<User, Long> {}

@Service
public class UserService {
    private UserRepository repo;  // forgot @Autowired

    public void addUser(String name) {
        User u = new User();
        u.setUsername(name);
        repo.save(u);             // NullPointerException at runtime
    }
}`,
        ],
        answer: `@Entity
public class User {
    @Id @GeneratedValue
    private Long id;
    private String username;
    // getters/setters
}

@Repository
public interface UserRepository extends JpaRepository<User, Long> {}

@Service
public class UserService {
    @Autowired
    private UserRepository repo;

    public void addUser(String name) {
        User u = new User();
        u.setUsername(name);
        repo.save(u);
    }
}`,
      },
    },
    // 13
    {
      group: "4",
      title: "Handling User Data",
      description:
        "In this step, you will learn how to retrieve a User entity by ID.",
      isCode: true,
      question: {
        questionText:
          "Write a Java code snippet using UserRepository to fetch a User by its ID.",
      },
    },
    // 14
    {
      group: "4",
      title: "Retrieving a User After Authentication",
      description:
        "In this step, you will learn how to retrieve the authenticated user principal.",
      isCode: true,
      isTerminal: false,
      question: {
        questionText:
          "Write a Spring Security code snippet to get the authenticated username in a controller.",
      },
    },
    // 15
    {
      group: "4",
      title: "Understanding the Authentication Flow",
      description:
        "In this step, you will learn about the typical flow of authentication in backend systems.",
      isSelectOrder: true,
      question: {
        questionText:
          "Arrange the following steps in the correct order for a typical JWT authentication flow in a Java backend.",
        options: [
          "User submits credentials to /login endpoint",
          "AuthenticationManager verifies credentials",
          "JWT token is generated and signed",
          "Client stores token locally",
          "Protected endpoints validate token",
        ],
        answer: [
          "User submits credentials to /login endpoint",
          "AuthenticationManager verifies credentials",
          "JWT token is generated and signed",
          "Client stores token locally",
          "Protected endpoints validate token",
        ],
      },
    },
    // 16
    {
      group: "4",
      title: "OAuth Authentication",
      description:
        "In this step, you will learn about OAuth-style authentication systems.",
      isSingleLineText: true,
      question: {
        questionText:
          "What is the widely used protocol for authorization that allows third-party services to access user data without exposing credentials?",
        placeholder: "Type your answer here...",
        answer: "OAuth 2.0",
      },
    },
    // 17
    {
      group: "4",
      title: "Using Environment Variables",
      description:
        "In this step, you will learn about using environment variables in backend development.",
      isText: true,
      question: {
        questionText: "What role do environment variables play in a codebase?",
      },
    },
    // 18
    {
      group: "4",
      title: "Database Relationships with JPA",
      description:
        "In this step, you will learn about defining relationships in JPA.",
      isCode: true,
      question: {
        questionText:
          "Write a JPA code snippet to define a one-to-many relationship between User and Post entities.",
      },
    },
    // 19
    {
      group: "4",
      title: "Interfacing with an API",
      description:
        "In this step, you will learn the common HTTP methods used to interface with a REST API.",
      isMultipleAnswerChoice: true,
      question: {
        questionText:
          "Which of the following HTTP methods are commonly used to interface with a REST API, and what do they do?",
        options: [
          "GET (Retrieves data)",
          "POST (Creates a new resource)",
          "PUT (Replaces a resource)",
          "PATCH (Partially updates a resource)",
          "DELETE (Deletes a resource)",
        ],
        answer: [
          "GET (Retrieves data)",
          "POST (Creates a new resource)",
          "PATCH (Partially updates a resource)",
          "DELETE (Deletes a resource)",
        ],
      },
    },
    // 20
    {
      group: "4",
      title: "Creating a JWT Authentication System",
      description:
        "In this step, you will create a simple user authentication system with JWT.",
      isSelectOrder: true,
      question: {
        questionText:
          "Arrange the steps with drag-and-drop to implement JWT authentication in a Spring Boot app.",
        options: [
          "Add jjwt dependency",
          "Configure security filter chain",
          "Define UserDetailsService",
          "Create /register endpoint",
          "Hash passwords before storing",
          "Create /login endpoint",
          "Authenticate credentials",
          "Generate JWT token",
          "Return token in response",
          "Validate token in filter",
        ],
        answer: [
          "Add jjwt dependency",
          "Configure security filter chain",
          "Define UserDetailsService",
          "Create /register endpoint",
          "Hash passwords before storing",
          "Create /login endpoint",
          "Authenticate credentials",
          "Generate JWT token",
          "Return token in response",
          "Validate token in filter",
        ],
      },
    },
    // 21
    {
      group: "4",
      title: "Deploying a Spring Boot Application",
      description:
        "In this step, you will learn how to deploy a Spring Boot application.",
      isText: true,
      question: {
        questionText:
          "Write the command to package and run your Spring Boot app with Maven.",
      },
    },
    // 22
    {
      group: "4",
      title: "Review With AI Conversation (optional)",
      isConversationReview: true,
      description: "Review the subjects you've answered",
      question: {
        questionText: "Let's chat about the questions we've worked on so far.",
        range: [69, 89],
      },
    },
    // 1
    {
      group: "5",
      title: "Benefits of Serverless Cloud Platforms",
      description:
        "Explore the advantages of using Firebase as a serverless backend for Android development.",
      isText: true,
      question: {
        questionText:
          "What are the key benefits of using Firebase as a serverless backend for an Android app, and how does it differ from a traditional server-based model?",
      },
    },
    // 2
    {
      group: "5",
      title: "Understanding Android Studio",
      description:
        "Learn what Android Studio is and why it's the primary IDE for Android development.",
      isText: true,
      question: {
        questionText:
          "What is Android Studio and why do most Android developers choose it?",
      },
    },
    // 3
    {
      group: "5",
      title: "Installing Java and Android SDK",
      description:
        "Install the Java JDK and Android SDK tools required for Android development.",
      isText: true,
      question: {
        questionText:
          "What roles do the Java JDK and the Android SDK play in building Android apps?",
      },
    },
    // 4
    {
      group: "5",
      title: "Adding Firebase to Gradle",
      description:
        "Configure your project-level Gradle file to include Firebase dependencies.",
      isSingleLineText: true,
      question: {
        questionText:
          "What lines do you add to your module-level `build.gradle` to include the Firebase BOM?",
        answer:
          "implementation platform('com.google.firebase:firebase-bom:31.2.3')",
      },
    },
    // 5
    {
      group: "5",
      title: "Applying Google Services Plugin",
      description:
        "Enable the Google Services Gradle plugin to integrate Firebase.",
      isSingleLineText: true,
      question: {
        questionText:
          "What line do you add to your project-level `build.gradle` to apply the Google Services plugin?",
        answer: "classpath 'com.google.gms:google-services:4.4.0'",
      },
    },
    // 6
    {
      group: "5",
      title: "Initializing a Firebase Project in Android",
      description:
        "Add the `google-services.json` file and apply the plugin in your module Gradle.",
      isSingleLineText: true,
      question: {
        questionText:
          "What file do you download from the Firebase console and where do you place it in your Android project?",
        answer: "google-services.json in app/",
      },
    },
    // 7
    {
      group: "5",
      title: "Selecting Firebase Modules",
      description:
        "Choose which Firebase Android SDK libraries to include in your app.",
      isMultipleAnswerChoice: true,
      question: {
        questionText:
          "Which of the following Firebase modules might you add to your Android app?",
        options: [
          "firebase-auth",
          "firebase-firestore",
          "firebase-database",
          "firebase-functions",
          "firebase-storage",
          "firebase-analytics",
        ],
        answer:
          "firebase-auth, firebase-firestore, firebase-storage, firebase-analytics",
      },
    },
    // 8
    {
      group: "5",
      title: "Configuring FirebaseApp",
      description: "Initialize Firebase in your Android `Application` class.",
      isCode: true,
      question: {
        questionText:
          "Write the Java code to initialize Firebase in `public void onCreate()` of your `Application` subclass.",
      },
    },
    // 9
    {
      group: "5",
      title: "Setting Up Firestore",
      description: "Learn how to obtain a Firestore instance and write data.",
      isCode: true,
      question: {
        questionText:
          "Write Java code to get `FirebaseFirestore` instance and add a document to `users` collection.",
      },
    },
    // 10
    {
      group: "5",
      title: "Understanding Authentication",
      description: "Learn about Firebase Authentication in Android.",
      isText: true,
      question: {
        questionText:
          "What is Firebase Authentication, and which sign-in methods does it support on Android?",
      },
    },
    // 11
    {
      group: "5",
      title: "Creating a User with FirebaseAuth",
      description: "Programmatically create a new user account in Android.",
      isCode: true,
      question: {
        questionText:
          "Write Java code using `FirebaseAuth.getInstance().createUserWithEmailAndPassword(...)`.",
      },
    },
    // 12
    {
      group: "5",
      title: "Retrieving the ID Token",
      description: "Obtain the current user's ID token on the client.",
      isCode: true,
      question: {
        questionText:
          "Write Java code to call `getCurrentUser().getIdToken(false)` and handle the result.",
      },
    },
    // 13
    {
      group: "5",
      title: "CRUD with Firestore",
      description: "Perform basic Firestore operations in Android.",
      isCodeCompletion: true,
      question: {
        questionText:
          "Complete the Java code to create, read, update, and delete a Firestore document.",
        options: [
          // 1) Correct sequence and syntax
          `FirebaseFirestore db = FirebaseFirestore.getInstance();
DocumentReference doc = db.collection("users").document("alice");
// create
doc.set(new User("alice@example.com", 30));
// read
doc.get().addOnSuccessListener(snapshot -> {
    User u = snapshot.toObject(User.class);
});
// update
doc.update("age", 31);
// delete
doc.delete();`,

          // 2) Forgot to handle asynchronous read success
          `FirebaseFirestore db = FirebaseFirestore.getInstance();
DocumentReference doc = db.collection("users").document("alice");
// create
doc.set(new User("alice@example.com", 30));
// read
User u = doc.get().toObject(User.class);  // missing addOnSuccessListener
// update
doc.update("age", 31);
// delete
doc.delete();`,

          // 3) Used add() instead of set(), creating a new doc ID
          `FirebaseFirestore db = FirebaseFirestore.getInstance();
CollectionReference users = db.collection("users");
// create
users.add(new User("alice@example.com", 30));  // wrong: adds new auto-ID doc
// read
DocumentReference doc = users.document("alice");
doc.get().addOnSuccessListener(snapshot -> {
    User u = snapshot.toObject(User.class);
});
// update
doc.update("age", 31);
// delete
doc.delete();`,

          // 4) Deleted the entire collection instead of the document
          `FirebaseFirestore db = FirebaseFirestore.getInstance();
DocumentReference doc = db.collection("users").document("alice");
// create
doc.set(new User("alice@example.com", 30));
// read
doc.get().addOnSuccessListener(snapshot -> {
    User u = snapshot.toObject(User.class);
});
// update
doc.update("age", 31);
// delete
db.collection("users").delete();  // invalid: delete() not on CollectionReference`,

          // 5) Misused update call with wrong field name
          `FirebaseFirestore db = FirebaseFirestore.getInstance();
DocumentReference doc = db.collection("users").document("alice");
// create
doc.set(new User("alice@example.com", 30));
// read
doc.get().addOnSuccessListener(snapshot -> {
    User u = snapshot.toObject(User.class);
});
// update
doc.update("username", "alice");  // wrong field key: should be "age"
// delete
doc.delete();`,
        ],
        answer: `FirebaseFirestore db = FirebaseFirestore.getInstance();
DocumentReference doc = db.collection("users").document("alice");
// create
doc.set(new User("alice@example.com", 30));
// read
doc.get().addOnSuccessListener(snapshot -> {
    User u = snapshot.toObject(User.class);
});
// update
doc.update("age", 31);
// delete
doc.delete();`,
      },
    },
    // 14
    {
      group: "5",
      title: "Calling Cloud Functions",
      description: "Invoke an HTTPS Callable Cloud Function from Android.",
      isCode: true,
      question: {
        questionText:
          'Write Java code to call `FirebaseFunctions.getInstance().getHttpsCallable("helloWorld").call()`.',
      },
    },
    // 15
    {
      group: "5",
      title: "Local Emulation",
      description: "Test Functions and Firestore locally with the emulator.",
      isSingleLineText: true,
      question: {
        questionText: "What command starts the local Firebase emulator suite?",
        answer: "firebase emulators:start",
      },
    },
    // 16
    {
      group: "5",
      title: "Deploying to Firebase",
      description: "Deploy only your Cloud Functions from the CLI.",
      isSingleLineText: true,
      question: {
        questionText: "What command do you use to deploy only Cloud Functions?",
        answer: "firebase deploy --only functions",
      },
    },
    // 17
    {
      group: "5",
      title: "Uploading to Storage",
      description: "Upload files to Firebase Storage in Android.",
      isCode: true,
      question: {
        questionText:
          "Write Java code using `FirebaseStorage.getInstance().getReference()` to upload a file.",
      },
    },
    // 18
    {
      group: "5",
      title: "Security Rules Basics",
      description: "Learn about Firestore security rules for Android clients.",
      isText: true,
      question: {
        questionText:
          "What are Firestore security rules and when are they evaluated for Android requests?",
      },
    },
    // 19
    {
      group: "5",
      title: "Performance Monitoring",
      description: "Explore Firebase Performance Monitoring for Android apps.",
      isText: true,
      question: {
        questionText:
          "Which Firebase product helps you monitor performance metrics in an Android app?",
      },
    },
    // 20
    {
      group: "5",
      title: "Popular Firebase Extensions",
      description: "Learn about official Firebase Extensions you can install.",
      isMultipleAnswerChoice: true,
      question: {
        questionText:
          "Which of the following are Firebase Extensions provided by Google?",
        options: [
          "Trigger Email via SendGrid",
          "Resize Images",
          "Translate Text",
          "Backup Realtime Database",
        ],
        answer:
          "Trigger Email via SendGrid, Resize Images, Translate Text, Backup Realtime Database",
      },
    },
    // 21
    {
      group: "5",
      title: "Review With AI Conversation (optional)",
      isConversationReview: true,
      description: "Review the subjects you've answered",
      question: {
        questionText: "Let's chat about the questions we've worked on so far.",
        range: [91, 110],
      },
    },
  ],
  // ['py-en']: [

  // ],
};

export const lectureSummaries = {
  en: {
    tutorial: {
      videoSrc: "", //string url
      content: <div>Hello world</div>, //jsx
      challengeQuestion: "",
    },
    1: {},
    2: {},
    3: {},
    4: {},
    5: {},
    6: {},
  },
  es: {
    tutorial: {},
    1: {},
    2: {},
    3: {},
    4: {},
    5: {},
    6: {},
  },
  "py-en": {
    tutorial: {
      videoSrc: "", //string url
      content: <div>Hello world</div>, //jsx
      challengeQuestion: "",
    },
    1: {},
    2: {},
    3: {},
    4: {},
    5: {},
    6: {},
  },
  "swift-end": {
    tutorial: {
      videoSrc: "", //string url
      content: <div>Hello world</div>, //jsx
      challengeQuestion: "",
    },
    1: {},
    2: {},
    3: {},
    4: {},
    5: {},
    6: {},
  },
  "android-en": {
    tutorial: {
      videoSrc: "", //string url
      content: <div>Hello world</div>, //jsx
      challengeQuestion: "",
    },
    1: {},
    2: {},
    3: {},
    4: {},
    5: {},
    6: {},
  },
  "compsci-en": {
    tutorial: {
      videoSrc: "", //string url
      content: <div>Hello world</div>, //jsx
      challengeQuestion: "",
    },
    1: {},
    2: {},
    3: {},
    4: {},
    5: {},
    6: {},
  },
};

export const generatedSteps = [];

export const tutorial_interface = [
  {
    group: "",
    title: "",
    description: "",
    isMultipleChoice: true,
    question: {
      questionText: "",
      options: ["", "", "", ""],
      answer: "",
    },
  },
  {
    group: "",
    title: "",
    description: "",
    isSelectOrder: true,
    question: {
      questionText: "",
      options: ["", "", "", ""],
      answer: ["", "", "", ""],
    },
  },
  {
    group: "",
    title: "",
    description: "",
    isMultipleAnswerChoice: true,
    question: {
      questionText: "",
      options: ["", "", "", "", "", ""],
      answer: ["", "", ""],
    },
  },
  {
    group: "",
    title: "",
    description: "",
    isCodeCompletion: true,
    question: {
      questionText: "",
      options: [``, ``, ``, ``],
      answer: ``,
    },
  },
  {
    group: "tutorial",
    title: "",
    description: "",
    isCode: true,
    isTerminal: false,
    question: {
      questionText: "",
    },
  },
  {
    group: "tutorial",
    title: "",
    description: "",
    isSingleLineText: true,
    question: {
      questionText: "",
      placeholder: "",
      answer: "",
    },
  },
  {
    group: "tutorial",
    title: "",
    description: "",
    isText: true,
    question: {
      questionText: "",
    },
  },
  {
    group: "tutorial",
    title: "",
    description: "",
    isCode: true,
    isTerminal: true,
    question: {
      questionText: "",
    },
  },
  {
    group: "tutorial",
    title: "",
    isConversationReview: true,
    description: "",
    question: {
      questionText: "",
      range: [1, 8],
    },
  },
];

export const celebrationMessages = {
  en: [
    "You're doing amazing! 🎉✨",
    "Fantastic job! Keep it up! 🚀🎈",
    "You're crushing it! 💪😄",
    "Awesome work! 👏🥳",
    "Impressive progress! 🌠🙌",
    "Way to go! 🥳🔥",
    "Outstanding performance! 🥇👏",
    "You're incredible! 🤩✨",
    "Keep up the fantastic work! 🎈🙌",
    "You've got this! 💪🎉",
    "Bravo! 👏🎊",
    "So proud of you! 🌟😊",
    "Keep up the amazing effort! 🙌🔥",
    "You're a total champion! 🏆😄",
    "Great job, keep rocking! 🤘🎉",
    "You're unstoppable today! 🚀💥",
    "Absolutely fantastic! 🌟🎉",
    "You're making waves! 🌊😄",
    "Keep being awesome! 😎✨",
    "Epic job! 🚀🥳",
    "You're flying high! ✈️😊",
    "Outstanding job! 🌟🎈",
    "You nailed it! 🎯😄",
    "Keep soaring! 🦅✨",
    "You're incredible! 🤩🙌",
    "You're on fire! 🔥🥳",
    "Amazing job, keep it up! 🚀😄",
    "You're thriving! 🌱😊",
    "Extraordinary effort! 🎖️👏",
    "Keep shining bright! ✨😄",
    "Magnificent performance! 🌟🙌",
    "You're unstoppable! 🚀💪",
    "You're a powerhouse! 💥🥳",
    "You're a true superstar! 🤩🌟",
    "Epic performance! 🚀🎉",
    "You're doing wonderfully! 😊👏",
    "Great momentum! Keep it going! 🌟🚀",
    "Keep dazzling! ✨😄",
    "You're making magic happen! ✨🪄",
    "You're unstoppable! 🚀🔥",
    "Incredible progress! 🙌😄",
    "You're phenomenal! 🌟🥳",
    "Keep shining bright! ✨🌞",
    "You're slaying! 🔥👏",
    "You're positively radiant! 😊✨",
    "You're unstoppable today! 🚀🎊",
    "Outstanding performance! 👏😊",
    "Keep being fabulous! 🌟🎈",
    "You're rocking this! 🎸🥳",
    "You're amazing! Keep going! 🌟✨",
    "You're absolutely brilliant! 💡🎉",
    "Keep conquering! 🏅🚀",
    "Fantastic work! Keep soaring! ✈️🌟",
    "You're truly impressive! 👏✨",
    "You're extraordinary! 🌟😊",
    "Great job! Keep thriving! 🌱🎉",
    "You're exceptional! 🎉🌟",
    "Keep up the awesome work! 🙌🥳",
    "You're fantastic! ✨😄",
    "You're truly inspirational! 🌈👏",
    "You're absolutely smashing it! 🚀💥",
    "You're outstanding! 🌟🎉",
    "Keep making us proud! 😊🙌",
    "You're truly unstoppable! 🚀🎈",
    "You're amazing! Keep pushing! 💪🥳",
    "You're a legend! 🏅😄",
    "Keep lighting it up! 🔥✨",
    "You're doing incredible! 🎉👏",
    "You're truly spectacular! 🌠😊",
    "Keep it going! You're doing great! 💪✨",
    "You're wonderful! 🌟😄",
    "You're unstoppable brilliance! 🚀✨",
    "You're absolutely rocking it! 🎸😊",
    "Keep reaching new heights! 🏔️🎉",
    "You're superb! ✨🙌",
    "You're on a fantastic roll! 🎲🥳",
    "Keep crushing those goals! 🎯😄",
    "You're brilliant! 💡✨",
    "You're fantastic beyond words! 🎉👏",
    "You're totally rocking it! 🤘😎",
    "Keep it up, superstar! 🌟😊",
    "You're shining bright today! ✨😄",
    "Keep smashing it! 🚀💥",
    "You're truly unstoppable! 🚀🎊",
    "Outstanding effort! 🎖️✨",
    "You're awesome, keep it going! 🎉😄",
    "Keep breaking barriers! 🚧💪",
    "You're extraordinary every day! 🎉😊",
    "Keep achieving greatness! 🏆✨",
    "You're a shining example! ✨😊",
    "You're a total winner! 🏅😄",
    "Keep shining, you're amazing! ✨🌞",
    "You're absolutely crushing it! 💪🔥",
    "You're fantastic today! 🎉😄",
    "Keep the greatness coming! 🚀✨",
    "You're inspirational! 🌈😊",
    "You're lighting it up! 🔥🎈",
    "Keep soaring high! 🦅✨",
    "You're doing an awesome job! 🎉😊",
    "You're unstoppable greatness! 🚀🌟",
    "Keep going strong! 💪😄",
    "You're absolutely remarkable! 🎖️✨",
    "Keep being amazing! 🌟😊",
    "You're thriving wonderfully! 🌱🎉",
    "You're absolutely incredible! 🌠😄",
    "Keep shining! ✨🎈",
    "You're exceptional! 🌟👏",
    "You're unstoppable brilliance today! 🚀😄",
    "Keep up the excellent work! 🎉🙌",
    "You're extraordinary! Keep going! 🌟😊",
    "Keep pushing forward! 🚀🎉",
    "You're making fantastic progress! 🎈😊",
    "You're an absolute champion! 🏆😄",
    "Keep slaying your goals! 🔥👏",
    "You're fantastic! Keep going strong! 🎉💪",
    "You're totally impressive! 🌟😄",
    "Keep rocking! 🎸✨",
    "You're absolutely magnificent! 🎉🌟",
    "You're on a roll! Keep it up! 🎲😄",
    "You're exceptional today! 🎉👏",
    "Keep shining brightly! ✨😊",
    "You're totally unstoppable! 🚀🥳",
    "You're thriving and inspiring! 🌱😊",
    "Keep excelling! 🎖️😄",
    "You're doing wonderfully today! 🌟🎉",
    "You're making it happen! 🚀✨",
    "Keep being unstoppable! 🔥💪",
    "You're spectacular! 🎉🌠",
    "Keep achieving greatness! 🏆✨",
    "You're positively radiant today! 😊✨",
    "Keep being fantastic! 🌟😄",
    "You're crushing everything! 💥💪",
    "Keep up the amazing work! 🎉🙌",
    "You're totally epic! 🚀😄",
    "You're remarkable! 🌟👏",
    "Keep shining, you're a star! ✨😊",
    "You're truly magnificent! 🎉😄",
    "You're on fire! 🔥🚀",
    "Keep being incredible! 🌟😄",
    "You're unstoppable today! 🚀✨",
  ],
  es: [
    "¡Lo estás haciendo increíble! 🎉✨",
    "¡Trabajo fantástico! ¡Sigue así! 🚀🎈",
    "¡Lo estás arrasando! 💪😄",
    "¡Excelente trabajo! 👏🥳",
    "¡Progreso impresionante! 🌠🙌",
    "¡Así se hace! 🥳🔥",
    "¡Actuación sobresaliente! 🥇👏",
    "¡Eres increíble! 🤩✨",
    "¡Sigue con el fantástico trabajo! 🎈🙌",
    "¡Tú puedes hacerlo! 💪🎉",
    "¡Bravo! 👏🎊",
    "¡Muy orgulloso de ti! 🌟😊",
    "¡Continúa con ese esfuerzo increíble! 🙌🔥",
    "¡Eres todo un campeón! 🏆😄",
    "¡Gran trabajo, sigue así! 🤘🎉",
    "¡Hoy eres imparable! 🚀💥",
    "¡Absolutamente fantástico! 🌟🎉",
    "¡Estás causando sensación! 🌊😄",
    "¡Sigue siendo increíble! 😎✨",
    "¡Trabajo épico! 🚀🥳",
    "¡Estás volando alto! ✈️😊",
    "¡Trabajo sobresaliente! 🌟🎈",
    "¡Lo clavaste! 🎯😄",
    "¡Sigue volando alto! 🦅✨",
    "¡Eres increíble! 🤩🙌",
    "¡Estás que ardes! 🔥🥳",
    "¡Trabajo increíble, sigue así! 🚀😄",
    "¡Estás floreciendo! 🌱😊",
    "¡Esfuerzo extraordinario! 🎖️👏",
    "¡Sigue brillando fuerte! ✨😄",
    "¡Actuación magnífica! 🌟🙌",
    "¡Eres imparable! 🚀💪",
    "¡Eres una fuerza imparable! 💥🥳",
    "¡Eres una verdadera estrella! 🤩🌟",
    "¡Actuación épica! 🚀🎉",
    "¡Lo estás haciendo maravillosamente! 😊👏",
    "¡Gran impulso! ¡Sigue adelante! 🌟🚀",
    "¡Sigue deslumbrando! ✨😄",
    "¡Estás haciendo magia! ✨🪄",
    "¡Eres imparable! 🚀🔥",
    "¡Progreso increíble! 🙌😄",
    "¡Eres fenomenal! 🌟🥳",
    "¡Sigue brillando! ✨🌞",
    "¡Estás arrasando! 🔥👏",
    "¡Estás radiante! 😊✨",
    "¡Hoy eres imparable! 🚀🎊",
    "¡Actuación excepcional! 👏😊",
    "¡Sigue siendo fabuloso! 🌟🎈",
    "¡Lo estás rockeando! 🎸🥳",
    "¡Eres increíble! ¡Sigue adelante! 🌟✨",
    "¡Eres absolutamente brillante! 💡🎉",
    "¡Sigue conquistando! 🏅🚀",
    "¡Trabajo fantástico! ¡Sigue volando alto! ✈️🌟",
    "¡Eres realmente impresionante! 👏✨",
    "¡Eres extraordinario! 🌟😊",
    "¡Gran trabajo! ¡Sigue floreciendo! 🌱🎉",
    "¡Eres excepcional! 🎉🌟",
    "¡Continúa con el excelente trabajo! 🙌🥳",
    "¡Eres fantástico! ✨😄",
    "¡Eres verdaderamente inspirador! 🌈👏",
    "¡Lo estás destrozando absolutamente! 🚀💥",
    "¡Eres sobresaliente! 🌟🎉",
    "¡Sigue haciéndonos sentir orgullosos! 😊🙌",
    "¡Eres verdaderamente imparable! 🚀🎈",
    "¡Eres increíble! ¡Sigue empujando! 💪🥳",
    "¡Eres una leyenda! 🏅😄",
    "¡Sigue encendiéndolo todo! 🔥✨",
    "¡Estás increíble! 🎉👏",
    "¡Eres realmente espectacular! 🌠😊",
    "¡Sigue así! ¡Lo estás haciendo genial! 💪✨",
    "¡Eres maravilloso! 🌟😄",
    "¡Tu brillantez es imparable! 🚀✨",
    "¡Lo estás haciendo genial! 🎸😊",
    "¡Sigue alcanzando nuevas alturas! 🏔️🎉",
    "¡Eres magnífico! ✨🙌",
    "¡Estás en una racha fantástica! 🎲🥳",
    "¡Sigue alcanzando esas metas! 🎯😄",
    "¡Eres brillante! 💡✨",
    "¡Eres fantástico más allá de las palabras! 🎉👏",
    "¡Lo estás rockeando totalmente! 🤘😎",
    "¡Sigue así, superestrella! 🌟😊",
    "¡Estás brillando hoy! ✨😄",
    "¡Sigue rompiéndola! 🚀💥",
    "¡Eres realmente imparable! 🚀🎊",
    "¡Esfuerzo sobresaliente! 🎖️✨",
    "¡Eres increíble, sigue así! 🎉😄",
    "¡Sigue rompiendo barreras! 🚧💪",
    "¡Eres extraordinario cada día! 🎉😊",
    "¡Sigue alcanzando grandeza! 🏆✨",
    "¡Eres un ejemplo brillante! ✨😊",
    "¡Eres un verdadero ganador! 🏅😄",
    "¡Sigue brillando, eres increíble! ✨🌞",
    "¡Lo estás haciendo genial! 💪🔥",
    "¡Hoy estás fantástico! 🎉😄",
    "¡Continúa con tu grandeza! 🚀✨",
    "¡Eres una inspiración! 🌈😊",
    "¡Estás encendiéndolo todo! 🔥🎈",
    "¡Sigue volando alto! 🦅✨",
    "¡Estás haciendo un trabajo increíble! 🎉😊",
    "¡Tu grandeza es imparable! 🚀🌟",
    "¡Sigue fuerte! 💪😄",
    "¡Eres absolutamente notable! 🎖️✨",
    "¡Sigue siendo increíble! 🌟😊",
    "¡Estás floreciendo maravillosamente! 🌱🎉",
    "¡Eres absolutamente increíble! 🌠😄",
    "¡Sigue brillando! ✨🎈",
    "¡Eres excepcional! 🌟👏",
    "¡Tu brillantez hoy es imparable! 🚀😄",
    "¡Continúa con el excelente trabajo! 🎉🙌",
    "¡Eres extraordinario! ¡Sigue adelante! 🌟😊",
    "¡Sigue avanzando! 🚀🎉",
    "¡Estás progresando fantásticamente! 🎈😊",
    "¡Eres un campeón absoluto! 🏆😄",
    "¡Sigue logrando tus objetivos! 🔥👏",
    "¡Eres fantástico! ¡Sigue fuerte! 🎉💪",
    "¡Eres totalmente impresionante! 🌟😄",
    "¡Sigue rockeando! 🎸✨",
    "¡Eres absolutamente magnífico! 🎉🌟",
    "¡Estás en racha! ¡Sigue así! 🎲😄",
    "¡Eres excepcional hoy! 🎉👏",
    "¡Sigue brillando intensamente! ✨😊",
    "¡Eres totalmente imparable! 🚀🥳",
    "¡Estás floreciendo e inspirando! 🌱😊",
    "¡Sigue sobresaliendo! 🎖️😄",
    "¡Hoy lo estás haciendo maravillosamente! 🌟🎉",
    "¡Estás haciéndolo realidad! 🚀✨",
    "¡Sigue siendo imparable! 🔥💪",
    "¡Eres espectacular! 🎉🌠",
    "¡Sigue alcanzando grandeza! 🏆✨",
    "¡Hoy estás radiante! 😊✨",
    "¡Sigue siendo fantástico! 🌟😄",
    "¡Estás arrasando con todo! 💥💪",
    "¡Continúa con el increíble trabajo! 🎉🙌",
    "¡Eres totalmente épico! 🚀😄",
    "¡Eres notable! 🌟👏",
    "¡Sigue brillando, eres una estrella! ✨😊",
    "¡Eres realmente magnífico! 🎉😄",
    "¡Estás que ardes! 🔥🚀",
    "¡Sigue siendo increíble! 🌟😄",
    "¡Hoy eres imparable! 🚀✨",
  ],
  "py-en": [
    "You're doing amazing! 🎉✨",
    "Fantastic job! Keep it up! 🚀🎈",
    "You're crushing it! 💪😄",
    "Awesome work! 👏🥳",
    "Impressive progress! 🌠🙌",
    "Way to go! 🥳🔥",
    "Outstanding performance! 🥇👏",
    "You're incredible! 🤩✨",
    "Keep up the fantastic work! 🎈🙌",
    "You've got this! 💪🎉",
    "Bravo! 👏🎊",
    "So proud of you! 🌟😊",
    "Keep up the amazing effort! 🙌🔥",
    "You're a total champion! 🏆😄",
    "Great job, keep rocking! 🤘🎉",
    "You're unstoppable today! 🚀💥",
    "Absolutely fantastic! 🌟🎉",
    "You're making waves! 🌊😄",
    "Keep being awesome! 😎✨",
    "Epic job! 🚀🥳",
    "You're flying high! ✈️😊",
    "Outstanding job! 🌟🎈",
    "You nailed it! 🎯😄",
    "Keep soaring! 🦅✨",
    "You're incredible! 🤩🙌",
    "You're on fire! 🔥🥳",
    "Amazing job, keep it up! 🚀😄",
    "You're thriving! 🌱😊",
    "Extraordinary effort! 🎖️👏",
    "Keep shining bright! ✨😄",
    "Magnificent performance! 🌟🙌",
    "You're unstoppable! 🚀💪",
    "You're a powerhouse! 💥🥳",
    "You're a true superstar! 🤩🌟",
    "Epic performance! 🚀🎉",
    "You're doing wonderfully! 😊👏",
    "Great momentum! Keep it going! 🌟🚀",
    "Keep dazzling! ✨😄",
    "You're making magic happen! ✨🪄",
    "You're unstoppable! 🚀🔥",
    "Incredible progress! 🙌😄",
    "You're phenomenal! 🌟🥳",
    "Keep shining bright! ✨🌞",
    "You're slaying! 🔥👏",
    "You're positively radiant! 😊✨",
    "You're unstoppable today! 🚀🎊",
    "Outstanding performance! 👏😊",
    "Keep being fabulous! 🌟🎈",
    "You're rocking this! 🎸🥳",
    "You're amazing! Keep going! 🌟✨",
    "You're absolutely brilliant! 💡🎉",
    "Keep conquering! 🏅🚀",
    "Fantastic work! Keep soaring! ✈️🌟",
    "You're truly impressive! 👏✨",
    "You're extraordinary! 🌟😊",
    "Great job! Keep thriving! 🌱🎉",
    "You're exceptional! 🎉🌟",
    "Keep up the awesome work! 🙌🥳",
    "You're fantastic! ✨😄",
    "You're truly inspirational! 🌈👏",
    "You're absolutely smashing it! 🚀💥",
    "You're outstanding! 🌟🎉",
    "Keep making us proud! 😊🙌",
    "You're truly unstoppable! 🚀🎈",
    "You're amazing! Keep pushing! 💪🥳",
    "You're a legend! 🏅😄",
    "Keep lighting it up! 🔥✨",
    "You're doing incredible! 🎉👏",
    "You're truly spectacular! 🌠😊",
    "Keep it going! You're doing great! 💪✨",
    "You're wonderful! 🌟😄",
    "You're unstoppable brilliance! 🚀✨",
    "You're absolutely rocking it! 🎸😊",
    "Keep reaching new heights! 🏔️🎉",
    "You're superb! ✨🙌",
    "You're on a fantastic roll! 🎲🥳",
    "Keep crushing those goals! 🎯😄",
    "You're brilliant! 💡✨",
    "You're fantastic beyond words! 🎉👏",
    "You're totally rocking it! 🤘😎",
    "Keep it up, superstar! 🌟😊",
    "You're shining bright today! ✨😄",
    "Keep smashing it! 🚀💥",
    "You're truly unstoppable! 🚀🎊",
    "Outstanding effort! 🎖️✨",
    "You're awesome, keep it going! 🎉😄",
    "Keep breaking barriers! 🚧💪",
    "You're extraordinary every day! 🎉😊",
    "Keep achieving greatness! 🏆✨",
    "You're a shining example! ✨😊",
    "You're a total winner! 🏅😄",
    "Keep shining, you're amazing! ✨🌞",
    "You're absolutely crushing it! 💪🔥",
    "You're fantastic today! 🎉😄",
    "Keep the greatness coming! 🚀✨",
    "You're inspirational! 🌈😊",
    "You're lighting it up! 🔥🎈",
    "Keep soaring high! 🦅✨",
    "You're doing an awesome job! 🎉😊",
    "You're unstoppable greatness! 🚀🌟",
    "Keep going strong! 💪😄",
    "You're absolutely remarkable! 🎖️✨",
    "Keep being amazing! 🌟😊",
    "You're thriving wonderfully! 🌱🎉",
    "You're absolutely incredible! 🌠😄",
    "Keep shining! ✨🎈",
    "You're exceptional! 🌟👏",
    "You're unstoppable brilliance today! 🚀😄",
    "Keep up the excellent work! 🎉🙌",
    "You're extraordinary! Keep going! 🌟😊",
    "Keep pushing forward! 🚀🎉",
    "You're making fantastic progress! 🎈😊",
    "You're an absolute champion! 🏆😄",
    "Keep slaying your goals! 🔥👏",
    "You're fantastic! Keep going strong! 🎉💪",
    "You're totally impressive! 🌟😄",
    "Keep rocking! 🎸✨",
    "You're absolutely magnificent! 🎉🌟",
    "You're on a roll! Keep it up! 🎲😄",
    "You're exceptional today! 🎉👏",
    "Keep shining brightly! ✨😊",
    "You're totally unstoppable! 🚀🥳",
    "You're thriving and inspiring! 🌱😊",
    "Keep excelling! 🎖️😄",
    "You're doing wonderfully today! 🌟🎉",
    "You're making it happen! 🚀✨",
    "Keep being unstoppable! 🔥💪",
    "You're spectacular! 🎉🌠",
    "Keep achieving greatness! 🏆✨",
    "You're positively radiant today! 😊✨",
    "Keep being fantastic! 🌟😄",
    "You're crushing everything! 💥💪",
    "Keep up the amazing work! 🎉🙌",
    "You're totally epic! 🚀😄",
    "You're remarkable! 🌟👏",
    "Keep shining, you're a star! ✨😊",
    "You're truly magnificent! 🎉😄",
    "You're on fire! 🔥🚀",
    "Keep being incredible! 🌟😄",
    "You're unstoppable today! 🚀✨",
  ],
  "swift-en": [
    "You're doing amazing! 🎉✨",
    "Fantastic job! Keep it up! 🚀🎈",
    "You're crushing it! 💪😄",
    "Awesome work! 👏🥳",
    "Impressive progress! 🌠🙌",
    "Way to go! 🥳🔥",
    "Outstanding performance! 🥇👏",
    "You're incredible! 🤩✨",
    "Keep up the fantastic work! 🎈🙌",
    "You've got this! 💪🎉",
    "Bravo! 👏🎊",
    "So proud of you! 🌟😊",
    "Keep up the amazing effort! 🙌🔥",
    "You're a total champion! 🏆😄",
    "Great job, keep rocking! 🤘🎉",
    "You're unstoppable today! 🚀💥",
    "Absolutely fantastic! 🌟🎉",
    "You're making waves! 🌊😄",
    "Keep being awesome! 😎✨",
    "Epic job! 🚀🥳",
    "You're flying high! ✈️😊",
    "Outstanding job! 🌟🎈",
    "You nailed it! 🎯😄",
    "Keep soaring! 🦅✨",
    "You're incredible! 🤩🙌",
    "You're on fire! 🔥🥳",
    "Amazing job, keep it up! 🚀😄",
    "You're thriving! 🌱😊",
    "Extraordinary effort! 🎖️👏",
    "Keep shining bright! ✨😄",
    "Magnificent performance! 🌟🙌",
    "You're unstoppable! 🚀💪",
    "You're a powerhouse! 💥🥳",
    "You're a true superstar! 🤩🌟",
    "Epic performance! 🚀🎉",
    "You're doing wonderfully! 😊👏",
    "Great momentum! Keep it going! 🌟🚀",
    "Keep dazzling! ✨😄",
    "You're making magic happen! ✨🪄",
    "You're unstoppable! 🚀🔥",
    "Incredible progress! 🙌😄",
    "You're phenomenal! 🌟🥳",
    "Keep shining bright! ✨🌞",
    "You're slaying! 🔥👏",
    "You're positively radiant! 😊✨",
    "You're unstoppable today! 🚀🎊",
    "Outstanding performance! 👏😊",
    "Keep being fabulous! 🌟🎈",
    "You're rocking this! 🎸🥳",
    "You're amazing! Keep going! 🌟✨",
    "You're absolutely brilliant! 💡🎉",
    "Keep conquering! 🏅🚀",
    "Fantastic work! Keep soaring! ✈️🌟",
    "You're truly impressive! 👏✨",
    "You're extraordinary! 🌟😊",
    "Great job! Keep thriving! 🌱🎉",
    "You're exceptional! 🎉🌟",
    "Keep up the awesome work! 🙌🥳",
    "You're fantastic! ✨😄",
    "You're truly inspirational! 🌈👏",
    "You're absolutely smashing it! 🚀💥",
    "You're outstanding! 🌟🎉",
    "Keep making us proud! 😊🙌",
    "You're truly unstoppable! 🚀🎈",
    "You're amazing! Keep pushing! 💪🥳",
    "You're a legend! 🏅😄",
    "Keep lighting it up! 🔥✨",
    "You're doing incredible! 🎉👏",
    "You're truly spectacular! 🌠😊",
    "Keep it going! You're doing great! 💪✨",
    "You're wonderful! 🌟😄",
    "You're unstoppable brilliance! 🚀✨",
    "You're absolutely rocking it! 🎸😊",
    "Keep reaching new heights! 🏔️🎉",
    "You're superb! ✨🙌",
    "You're on a fantastic roll! 🎲🥳",
    "Keep crushing those goals! 🎯😄",
    "You're brilliant! 💡✨",
    "You're fantastic beyond words! 🎉👏",
    "You're totally rocking it! 🤘😎",
    "Keep it up, superstar! 🌟😊",
    "You're shining bright today! ✨😄",
    "Keep smashing it! 🚀💥",
    "You're truly unstoppable! 🚀🎊",
    "Outstanding effort! 🎖️✨",
    "You're awesome, keep it going! 🎉😄",
    "Keep breaking barriers! 🚧💪",
    "You're extraordinary every day! 🎉😊",
    "Keep achieving greatness! 🏆✨",
    "You're a shining example! ✨😊",
    "You're a total winner! 🏅😄",
    "Keep shining, you're amazing! ✨🌞",
    "You're absolutely crushing it! 💪🔥",
    "You're fantastic today! 🎉😄",
    "Keep the greatness coming! 🚀✨",
    "You're inspirational! 🌈😊",
    "You're lighting it up! 🔥🎈",
    "Keep soaring high! 🦅✨",
    "You're doing an awesome job! 🎉😊",
    "You're unstoppable greatness! 🚀🌟",
    "Keep going strong! 💪😄",
    "You're absolutely remarkable! 🎖️✨",
    "Keep being amazing! 🌟😊",
    "You're thriving wonderfully! 🌱🎉",
    "You're absolutely incredible! 🌠😄",
    "Keep shining! ✨🎈",
    "You're exceptional! 🌟👏",
    "You're unstoppable brilliance today! 🚀😄",
    "Keep up the excellent work! 🎉🙌",
    "You're extraordinary! Keep going! 🌟😊",
    "Keep pushing forward! 🚀🎉",
    "You're making fantastic progress! 🎈😊",
    "You're an absolute champion! 🏆😄",
    "Keep slaying your goals! 🔥👏",
    "You're fantastic! Keep going strong! 🎉💪",
    "You're totally impressive! 🌟😄",
    "Keep rocking! 🎸✨",
    "You're absolutely magnificent! 🎉🌟",
    "You're on a roll! Keep it up! 🎲😄",
    "You're exceptional today! 🎉👏",
    "Keep shining brightly! ✨😊",
    "You're totally unstoppable! 🚀🥳",
    "You're thriving and inspiring! 🌱😊",
    "Keep excelling! 🎖️😄",
    "You're doing wonderfully today! 🌟🎉",
    "You're making it happen! 🚀✨",
    "Keep being unstoppable! 🔥💪",
    "You're spectacular! 🎉🌠",
    "Keep achieving greatness! 🏆✨",
    "You're positively radiant today! 😊✨",
    "Keep being fantastic! 🌟😄",
    "You're crushing everything! 💥💪",
    "Keep up the amazing work! 🎉🙌",
    "You're totally epic! 🚀😄",
    "You're remarkable! 🌟👏",
    "Keep shining, you're a star! ✨😊",
    "You're truly magnificent! 🎉😄",
    "You're on fire! 🔥🚀",
    "Keep being incredible! 🌟😄",
    "You're unstoppable today! 🚀✨",
  ],
  "android-en": [
    "You're doing amazing! 🎉✨",
    "Fantastic job! Keep it up! 🚀🎈",
    "You're crushing it! 💪😄",
    "Awesome work! 👏🥳",
    "Impressive progress! 🌠🙌",
    "Way to go! 🥳🔥",
    "Outstanding performance! 🥇👏",
    "You're incredible! 🤩✨",
    "Keep up the fantastic work! 🎈🙌",
    "You've got this! 💪🎉",
    "Bravo! 👏🎊",
    "So proud of you! 🌟😊",
    "Keep up the amazing effort! 🙌🔥",
    "You're a total champion! 🏆😄",
    "Great job, keep rocking! 🤘🎉",
    "You're unstoppable today! 🚀💥",
    "Absolutely fantastic! 🌟🎉",
    "You're making waves! 🌊😄",
    "Keep being awesome! 😎✨",
    "Epic job! 🚀🥳",
    "You're flying high! ✈️😊",
    "Outstanding job! 🌟🎈",
    "You nailed it! 🎯😄",
    "Keep soaring! 🦅✨",
    "You're incredible! 🤩🙌",
    "You're on fire! 🔥🥳",
    "Amazing job, keep it up! 🚀😄",
    "You're thriving! 🌱😊",
    "Extraordinary effort! 🎖️👏",
    "Keep shining bright! ✨😄",
    "Magnificent performance! 🌟🙌",
    "You're unstoppable! 🚀💪",
    "You're a powerhouse! 💥🥳",
    "You're a true superstar! 🤩🌟",
    "Epic performance! 🚀🎉",
    "You're doing wonderfully! 😊👏",
    "Great momentum! Keep it going! 🌟🚀",
    "Keep dazzling! ✨😄",
    "You're making magic happen! ✨🪄",
    "You're unstoppable! 🚀🔥",
    "Incredible progress! 🙌😄",
    "You're phenomenal! 🌟🥳",
    "Keep shining bright! ✨🌞",
    "You're slaying! 🔥👏",
    "You're positively radiant! 😊✨",
    "You're unstoppable today! 🚀🎊",
    "Outstanding performance! 👏😊",
    "Keep being fabulous! 🌟🎈",
    "You're rocking this! 🎸🥳",
    "You're amazing! Keep going! 🌟✨",
    "You're absolutely brilliant! 💡🎉",
    "Keep conquering! 🏅🚀",
    "Fantastic work! Keep soaring! ✈️🌟",
    "You're truly impressive! 👏✨",
    "You're extraordinary! 🌟😊",
    "Great job! Keep thriving! 🌱🎉",
    "You're exceptional! 🎉🌟",
    "Keep up the awesome work! 🙌🥳",
    "You're fantastic! ✨😄",
    "You're truly inspirational! 🌈👏",
    "You're absolutely smashing it! 🚀💥",
    "You're outstanding! 🌟🎉",
    "Keep making us proud! 😊🙌",
    "You're truly unstoppable! 🚀🎈",
    "You're amazing! Keep pushing! 💪🥳",
    "You're a legend! 🏅😄",
    "Keep lighting it up! 🔥✨",
    "You're doing incredible! 🎉👏",
    "You're truly spectacular! 🌠😊",
    "Keep it going! You're doing great! 💪✨",
    "You're wonderful! 🌟😄",
    "You're unstoppable brilliance! 🚀✨",
    "You're absolutely rocking it! 🎸😊",
    "Keep reaching new heights! 🏔️🎉",
    "You're superb! ✨🙌",
    "You're on a fantastic roll! 🎲🥳",
    "Keep crushing those goals! 🎯😄",
    "You're brilliant! 💡✨",
    "You're fantastic beyond words! 🎉👏",
    "You're totally rocking it! 🤘😎",
    "Keep it up, superstar! 🌟😊",
    "You're shining bright today! ✨😄",
    "Keep smashing it! 🚀💥",
    "You're truly unstoppable! 🚀🎊",
    "Outstanding effort! 🎖️✨",
    "You're awesome, keep it going! 🎉😄",
    "Keep breaking barriers! 🚧💪",
    "You're extraordinary every day! 🎉😊",
    "Keep achieving greatness! 🏆✨",
    "You're a shining example! ✨😊",
    "You're a total winner! 🏅😄",
    "Keep shining, you're amazing! ✨🌞",
    "You're absolutely crushing it! 💪🔥",
    "You're fantastic today! 🎉😄",
    "Keep the greatness coming! 🚀✨",
    "You're inspirational! 🌈😊",
    "You're lighting it up! 🔥🎈",
    "Keep soaring high! 🦅✨",
    "You're doing an awesome job! 🎉😊",
    "You're unstoppable greatness! 🚀🌟",
    "Keep going strong! 💪😄",
    "You're absolutely remarkable! 🎖️✨",
    "Keep being amazing! 🌟😊",
    "You're thriving wonderfully! 🌱🎉",
    "You're absolutely incredible! 🌠😄",
    "Keep shining! ✨🎈",
    "You're exceptional! 🌟👏",
    "You're unstoppable brilliance today! 🚀😄",
    "Keep up the excellent work! 🎉🙌",
    "You're extraordinary! Keep going! 🌟😊",
    "Keep pushing forward! 🚀🎉",
    "You're making fantastic progress! 🎈😊",
    "You're an absolute champion! 🏆😄",
    "Keep slaying your goals! 🔥👏",
    "You're fantastic! Keep going strong! 🎉💪",
    "You're totally impressive! 🌟😄",
    "Keep rocking! 🎸✨",
    "You're absolutely magnificent! 🎉🌟",
    "You're on a roll! Keep it up! 🎲😄",
    "You're exceptional today! 🎉👏",
    "Keep shining brightly! ✨😊",
    "You're totally unstoppable! 🚀🥳",
    "You're thriving and inspiring! 🌱😊",
    "Keep excelling! 🎖️😄",
    "You're doing wonderfully today! 🌟🎉",
    "You're making it happen! 🚀✨",
    "Keep being unstoppable! 🔥💪",
    "You're spectacular! 🎉🌠",
    "Keep achieving greatness! 🏆✨",
    "You're positively radiant today! 😊✨",
    "Keep being fantastic! 🌟😄",
    "You're crushing everything! 💥💪",
    "Keep up the amazing work! 🎉🙌",
    "You're totally epic! 🚀😄",
    "You're remarkable! 🌟👏",
    "Keep shining, you're a star! ✨😊",
    "You're truly magnificent! 🎉😄",
    "You're on fire! 🔥🚀",
    "Keep being incredible! 🌟😄",
    "You're unstoppable today! 🚀✨",
  ],
  "compsci-en": [
    "You're doing amazing! 🎉✨",
    "Fantastic job! Keep it up! 🚀🎈",
    "You're crushing it! 💪😄",
    "Awesome work! 👏🥳",
    "Impressive progress! 🌠🙌",
    "Way to go! 🥳🔥",
    "Outstanding performance! 🥇👏",
    "You're incredible! 🤩✨",
    "Keep up the fantastic work! 🎈🙌",
    "You've got this! 💪🎉",
    "Bravo! 👏🎊",
    "So proud of you! 🌟😊",
    "Keep up the amazing effort! 🙌🔥",
    "You're a total champion! 🏆😄",
    "Great job, keep rocking! 🤘🎉",
    "You're unstoppable today! 🚀💥",
    "Absolutely fantastic! 🌟🎉",
    "You're making waves! 🌊😄",
    "Keep being awesome! 😎✨",
    "Epic job! 🚀🥳",
    "You're flying high! ✈️😊",
    "Outstanding job! 🌟🎈",
    "You nailed it! 🎯😄",
    "Keep soaring! 🦅✨",
    "You're incredible! 🤩🙌",
    "You're on fire! 🔥🥳",
    "Amazing job, keep it up! 🚀😄",
    "You're thriving! 🌱😊",
    "Extraordinary effort! 🎖️👏",
    "Keep shining bright! ✨😄",
    "Magnificent performance! 🌟🙌",
    "You're unstoppable! 🚀💪",
    "You're a powerhouse! 💥🥳",
    "You're a true superstar! 🤩🌟",
    "Epic performance! 🚀🎉",
    "You're doing wonderfully! 😊👏",
    "Great momentum! Keep it going! 🌟🚀",
    "Keep dazzling! ✨😄",
    "You're making magic happen! ✨🪄",
    "You're unstoppable! 🚀🔥",
    "Incredible progress! 🙌😄",
    "You're phenomenal! 🌟🥳",
    "Keep shining bright! ✨🌞",
    "You're slaying! 🔥👏",
    "You're positively radiant! 😊✨",
    "You're unstoppable today! 🚀🎊",
    "Outstanding performance! 👏😊",
    "Keep being fabulous! 🌟🎈",
    "You're rocking this! 🎸🥳",
    "You're amazing! Keep going! 🌟✨",
    "You're absolutely brilliant! 💡🎉",
    "Keep conquering! 🏅🚀",
    "Fantastic work! Keep soaring! ✈️🌟",
    "You're truly impressive! 👏✨",
    "You're extraordinary! 🌟😊",
    "Great job! Keep thriving! 🌱🎉",
    "You're exceptional! 🎉🌟",
    "Keep up the awesome work! 🙌🥳",
    "You're fantastic! ✨😄",
    "You're truly inspirational! 🌈👏",
    "You're absolutely smashing it! 🚀💥",
    "You're outstanding! 🌟🎉",
    "Keep making us proud! 😊🙌",
    "You're truly unstoppable! 🚀🎈",
    "You're amazing! Keep pushing! 💪🥳",
    "You're a legend! 🏅😄",
    "Keep lighting it up! 🔥✨",
    "You're doing incredible! 🎉👏",
    "You're truly spectacular! 🌠😊",
    "Keep it going! You're doing great! 💪✨",
    "You're wonderful! 🌟😄",
    "You're unstoppable brilliance! 🚀✨",
    "You're absolutely rocking it! 🎸😊",
    "Keep reaching new heights! 🏔️🎉",
    "You're superb! ✨🙌",
    "You're on a fantastic roll! 🎲🥳",
    "Keep crushing those goals! 🎯😄",
    "You're brilliant! 💡✨",
    "You're fantastic beyond words! 🎉👏",
    "You're totally rocking it! 🤘😎",
    "Keep it up, superstar! 🌟😊",
    "You're shining bright today! ✨😄",
    "Keep smashing it! 🚀💥",
    "You're truly unstoppable! 🚀🎊",
    "Outstanding effort! 🎖️✨",
    "You're awesome, keep it going! 🎉😄",
    "Keep breaking barriers! 🚧💪",
    "You're extraordinary every day! 🎉😊",
    "Keep achieving greatness! 🏆✨",
    "You're a shining example! ✨😊",
    "You're a total winner! 🏅😄",
    "Keep shining, you're amazing! ✨🌞",
    "You're absolutely crushing it! 💪🔥",
    "You're fantastic today! 🎉😄",
    "Keep the greatness coming! 🚀✨",
    "You're inspirational! 🌈😊",
    "You're lighting it up! 🔥🎈",
    "Keep soaring high! 🦅✨",
    "You're doing an awesome job! 🎉😊",
    "You're unstoppable greatness! 🚀🌟",
    "Keep going strong! 💪😄",
    "You're absolutely remarkable! 🎖️✨",
    "Keep being amazing! 🌟😊",
    "You're thriving wonderfully! 🌱🎉",
    "You're absolutely incredible! 🌠😄",
    "Keep shining! ✨🎈",
    "You're exceptional! 🌟👏",
    "You're unstoppable brilliance today! 🚀😄",
    "Keep up the excellent work! 🎉🙌",
    "You're extraordinary! Keep going! 🌟😊",
    "Keep pushing forward! 🚀🎉",
    "You're making fantastic progress! 🎈😊",
    "You're an absolute champion! 🏆😄",
    "Keep slaying your goals! 🔥👏",
    "You're fantastic! Keep going strong! 🎉💪",
    "You're totally impressive! 🌟😄",
    "Keep rocking! 🎸✨",
    "You're absolutely magnificent! 🎉🌟",
    "You're on a roll! Keep it up! 🎲😄",
    "You're exceptional today! 🎉👏",
    "Keep shining brightly! ✨😊",
    "You're totally unstoppable! 🚀🥳",
    "You're thriving and inspiring! 🌱😊",
    "Keep excelling! 🎖️😄",
    "You're doing wonderfully today! 🌟🎉",
    "You're making it happen! 🚀✨",
    "Keep being unstoppable! 🔥💪",
    "You're spectacular! 🎉🌠",
    "Keep achieving greatness! 🏆✨",
    "You're positively radiant today! 😊✨",
    "Keep being fantastic! 🌟😄",
    "You're crushing everything! 💥💪",
    "Keep up the amazing work! 🎉🙌",
    "You're totally epic! 🚀😄",
    "You're remarkable! 🌟👏",
    "Keep shining, you're a star! ✨😊",
    "You're truly magnificent! 🎉😄",
    "You're on fire! 🔥🚀",
    "Keep being incredible! 🌟😄",
    "You're unstoppable today! 🚀✨",
  ],
};

export const getRandomCelebrationMessage = (userLanguage = "en") => {
  const messages = celebrationMessages[userLanguage] || celebrationMessages.en;
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
};
