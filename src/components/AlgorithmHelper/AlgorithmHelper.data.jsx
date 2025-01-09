// these functions are seperated because doing them together is too difficult for AI to process well.

export const LinkedListTree = () => {
  return {
    content:
      "Linked Lists are linear data structures where elements are nodes linked using pointers. They are useful for their dynamic size and efficient insertions/deletions. Linked lists can be singly or doubly linked.",
    code: `
    class Node {
      constructor(value = 0, next = null) {
        this.value = value;
        this.next = next;
      }
    }
    
    class LinkedList {
      constructor() {
        this.head = null;
      }
    
      append(value) {
        if (!this.head) {
          this.head = new Node(value);
          return;
        }
        let current = this.head;
        while (current.next) {
          current = current.next;
        }
        current.next = new Node(value);
      }
    }
    `,
    "Merging/Sorting": {
      content:
        "Techniques for merging and sorting linked lists are essential for optimizing performance and simplifying data processing. Merge sort and quicksort are popular algorithms for this purpose.",
      code: `
    function mergeSort(head) {
      if (!head || !head.next) return head;
    
      const mid = getMid(head);
      const left = mergeSort(head);
      const right = mergeSort(mid);
      return merge(left, right);
    }
    
    function getMid(head) {
      let slow = head;
      let fast = head;
      let prev = null;
      while (fast && fast.next) {
        prev = slow;
        slow = slow.next;
        fast = fast.next.next;
      }
      if (prev) prev.next = null;
      return slow;
    }
    
    function merge(left, right) {
      const dummy = new Node();
      let current = dummy;
      while (left && right) {
        if (left.value < right.value) {
          current.next = left;
          left = left.next;
        } else {
          current.next = right;
          right = right.next;
        }
        current = current.next;
      }
      current.next = left || right;
      return dummy.next;
    }
    `,
      "Two Pointers": {
        content:
          "Use the Two Pointers technique to iterate through a list with two different speeds or directions. It's commonly used to find pairs or sublists that meet specific conditions, like detecting cycles.",
        code: `
    function hasCycle(head) {
      let slow = head;
      let fast = head;
      while (fast && fast.next) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow === fast) return true;
      }
      return false;
    }
    `,
      },
      "Quick Sort": {
        content:
          "Quick Sort is efficient for sorting linked lists due to its average O(n log n) time complexity. It's a crucial technique for problems requiring fast sorting algorithms.",
        code: `
    function quickSort(head) {
      if (!head || !head.next) return head;
    
      let pivot = head;
      let lessDummy = new Node();
      let greaterDummy = new Node();
      let less = lessDummy;
      let greater = greaterDummy;
      let current = head.next;
    
      while (current) {
        if (current.value < pivot.value) {
          less.next = current;
          less = less.next;
        } else {
          greater.next = current;
          greater = greater.next;
        }
        current = current.next;
      }
      less.next = null;
      greater.next = null;
    
      lessDummy.next = quickSort(lessDummy.next);
      greaterDummy.next = quickSort(greaterDummy.next);
    
      let tail = lessDummy.next;
      while (tail && tail.next) {
        tail = tail.next;
      }
      if (tail) {
        tail.next = pivot;
        pivot.next = greaterDummy.next;
      } else {
        pivot.next = greaterDummy.next;
        return pivot;
      }
      return lessDummy.next;
    }
    `,
      },
    },
    Design: {
      content:
        "Design patterns and techniques for linked lists include various approaches to optimize data storage and retrieval. These patterns help in efficiently managing and utilizing linked lists.",
      code: `
    class Node {
      constructor(key, value) {
        this.key = key;
        this.value = value;
        this.prev = null;
        this.next = null;
      }
    }
    
    class LRUCache {
      constructor(capacity) {
        this.capacity = capacity;
        this.cache = new Map();
        this.head = new Node(0, 0);
        this.tail = new Node(0, 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
      }
    
      _add(node) {
        node.next = this.head.next;
        node.next.prev = node;
        this.head.next = node;
        node.prev = this.head;
      }
    
      _remove(node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
      }
    
      get(key) {
        if (this.cache.has(key)) {
          const node = this.cache.get(key);
          this._remove(node);
          this._add(node);
          return node.value;
        }
        return -1;
      }
    
      put(key, value) {
        if (this.cache.has(key)) {
          this._remove(this.cache.get(key));
        }
        const node = new Node(key, value);
        this._add(node);
        this.cache.set(key, node);
        if (this.cache.size > this.capacity) {
          const tail = this.tail.prev;
          this._remove(tail);
          this.cache.delete(tail.key);
        }
      }
    }
    `,
      "LFU Cache": {
        content:
          "Implementing LFU Cache using linked lists involves maintaining frequency counts for each element. This ensures that the least frequently used items are efficiently managed.",
        code: `
    class LFUCache {
      constructor(capacity) {
        this.capacity = capacity;
        this.minFreq = 0;
        this.cache = new Map();
        this.freqMap = new Map();
      }
    
      _updateFreq(node) {
        const { key, value, freq } = node;
        this.freqMap.get(freq).delete(key);
        if (!this.freqMap.get(freq).size) {
          this.freqMap.delete(freq);
          if (this.minFreq === freq) this.minFreq++;
        }
        node.freq++;
        if (!this.freqMap.has(node.freq)) this.freqMap.set(node.freq, new Map());
        this.freqMap.get(node.freq).set(key, node);
      }
    
      get(key) {
        if (!this.cache.has(key)) return -1;
        const node = this.cache.get(key);
        this._updateFreq(node);
        return node.value;
      }
    
      put(key, value) {
        if (this.capacity === 0) return;
        if (this.cache.has(key)) {
          const node = this.cache.get(key);
          node.value = value;
          this._updateFreq(node);
        } else {
          if (this.cache.size >= this.capacity) {
            const minFreqKeys = this.freqMap.get(this.minFreq);
            const firstKey = minFreqKeys.keys().next().value;
            minFreqKeys.delete(firstKey);
            if (!minFreqKeys.size) this.freqMap.delete(this.minFreq);
            this.cache.delete(firstKey);
          }
          const newNode = { key, value, freq: 1 };
          this.cache.set(key, newNode);
          if (!this.freqMap.has(1)) this.freqMap.set(1, new Map());
          this.freqMap.get(1).set(key, newNode);
          this.minFreq = 1;
        }
      }
    }
    `,
        "Hash Map": {
          content:
            "Hash Maps provide O(1) average time complexity for insertions and lookups. This makes them ideal for implementing LFU caches where quick access and updates are crucial.",
          code: `
    class HashMap {
      constructor() {
        this.map = new Map();
      }
    
      set(key, value) {
        this.map.set(key, value);
      }
    
      get(key) {
        return this.map.get(key);
      }
    
      has(key) {
        return this.map.has(key);
      }
    
      delete(key) {
        return this.map.delete(key);
      }
    
      size() {
        return this.map.size();
      }
    }
    `,
        },
        "Doubly Linked List": {
          content:
            "Doubly Linked Lists are used in conjunction with Hash Maps in LFU cache implementations. This maintains the order of elements with O(1) insertion and deletion from both ends.",
          code: `
    class Node {
      constructor(key, value) {
        this.key = key;
        this.value = value;
        this.prev = null;
        this.next = null;
      }
    }
    
    class DoublyLinkedList {
      constructor() {
        this.head = new Node(null, null);
        this.tail = new Node(null, null);
        this.head.next = this.tail;
        this.tail.prev = this.head;
      }
    
      add(node) {
        node.prev = this.head;
        node.next = this.head.next;
        this.head.next.prev = node;
        this.head.next = node;
      }
    
      remove(node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
      }
    
      pop() {
        if (this.head.next === this.tail) return null;
        const node = this.tail.prev;
        this.remove(node);
        return node;
      }
    }
    `,
        },
      },
      "Stack/Queue": {
        content:
          "Using linked lists to implement stacks and queues allows for dynamic memory allocation. This can handle a flexible number of elements efficiently.",
        code: `
    class Node {
      constructor(value = 0, next = null) {
        this.value = value;
        this.next = next;
      }
    }
    
    class Stack {
      constructor() {
        this.head = null;
      }
    
      push(value) {
        const newNode = new Node(value);
        newNode.next = this.head;
        this.head = newNode;
      }
    
      pop() {
        if (!this.head) return null;
        const value = this.head.value;
        this.head = this.head.next;
        return value;
      }
    }
    
    class Queue {
      constructor() {
        this.head = null;
        this.tail = null;
      }
    
      enqueue(value) {
        const newNode = new Node(value);
        if (this.tail) {
          this.tail.next = newNode;
        }
        this.tail = newNode;
        if (!this.head) {
          this.head = newNode;
        }
      }
    
      dequeue() {
        if (!this.head) return null;
        const value = this.head.value;
        this.head = this.head.next;
        if (!this.head) {
          this.tail = null;
        }
        return value;
      }
    }
    `,
        "Circular Queue": {
          content:
            "Circular Queues implemented with linked lists can efficiently manage fixed-size buffers. This avoids the need for resizing and allows for continuous use of memory.",
          code: `
    class Node {
      constructor(value = 0, next = null) {
        this.value = value;
        this.next = next;
      }
    }
    
    class CircularQueue {
      constructor(k) {
        this.size = k;
        this.count = 0;
        this.head = null;
        this.tail = null;
      }
    
      enqueue(value) {
        if (this.isFull()) return false;
        const newNode = new Node(value);
        if (!this.head) {
          this.head = newNode;
        } else {
          this.tail.next = newNode;
        }
        this.tail = newNode;
        this.tail.next = this.head;
        this.count++;
        return true;
      }
    
      dequeue() {
        if (this.isEmpty()) return false;
        const value = this.head.value;
        if (this.head === this.tail) {
          this.head = null;
          this.tail = null;
        } else {
          this.head = this.head.next;
          this.tail.next = this.head;
        }
        this.count--;
        return value;
      }
    
      isFull() {
        return this.count === this.size;
      }
    
      isEmpty() {
        return this.count === 0;
      }
    }
    `,
        },
      },
    },
    "Perform Reversal": {
      content:
        "Techniques for reversing linked lists are crucial for many applications. They can be used to solve problems involving list reordering, palindrome checking, and more.",
      code: `
    function reverseLinkedList(head) {
      let prev = null;
      let current = head;
      while (current) {
        let nextNode = current.next;
        current.next = prev;
        prev = current;
        current = nextNode;
      }
      return prev;
    }
    `,
      "In-Place Reversal": {
        content:
          "In-Place Reversal of linked lists involves reversing the nodes without using extra space. This technique is useful in memory-constrained environments.",
        code: `
    function reverseInPlace(head) {
      let prev = null;
      let current = head;
      while (current) {
        const nextNode = current.next;
        current.next = prev;
        prev = current;
        current = nextNode;
      }
      return prev;
    }
    `,
      },
    },
    "Cycle Detection": {
      content:
        "Detecting cycles in linked lists is essential to prevent infinite loops in algorithms. Various techniques, such as Floyd's Tortoise and Hare, are used for this purpose.",
      code: `
    function detectCycle(head) {
      let slow = head;
      let fast = head;
      while (fast && fast.next) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow === fast) return true;
      }
      return false;
    }
    `,
      "Floyd’s Tortoise and Hare": {
        content:
          "Floyd’s Tortoise and Hare algorithm is a popular technique for cycle detection. It uses two pointers moving at different speeds to detect a cycle.",
        code: `
    function hasCycle(head) {
      let slow = head;
      let fast = head;
      while (fast && fast.next) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow === fast) return true;
      }
      return false;
    }
    `,
      },
    },
    "Find Longest/Shortest Continuous Portion": {
      content:
        "Techniques for finding the longest or shortest continuous portions in linked lists are useful for problems involving subsequences. They help in optimizing searches and computations.",
      code: `
    function lengthOfLongestSubstring(s) {
      const charSet = new Set();
      let l = 0;
      let result = 0;
      for (let r = 0; r < s.length; r++) {
        while (charSet.has(s[r])) {
          charSet.delete(s[l]);
          l++;
        }
        charSet.add(s[r]);
        result = Math.max(result, r - l + 1);
      }
      return result;
    }
    `,
      "Sliding Window": {
        content:
          "Using the sliding window technique in linked lists allows for efficient searching of subsequences. This is particularly useful in problems involving unique elements or specific patterns.",
        code: `
    function findLongestUniqueSubstring(s) {
      const charMap = new Map();
      let left = 0;
      let right = 0;
      let maxLength = 0;
    
      while (right < s.length) {
        if (charMap.has(s[right])) {
          left = Math.max(charMap.get(s[right]) + 1, left);
        }
        charMap.set(s[right], right);
        maxLength = Math.max(maxLength, right - left + 1);
        right++;
      }
      return maxLength;
    }
    `,
        "Hash Map/Set": {
          content:
            "Using Hash Map/Set with Sliding Window allows for O(n) time complexity in problems involving unique elements or specific properties. This makes searches more efficient and scalable.",
          code: `
    function lengthOfLongestUniqueSubstring(s) {
      const charSet = new Set();
      let left = 0;
      let maxLength = 0;
    
      for (let right = 0; right < s.length; right++) {
        while (charSet.has(s[right])) {
          charSet.delete(s[left]);
          left++;
        }
        charSet.add(s[right]);
        maxLength = Math.max(maxLength, right - left + 1);
      }
      return maxLength;
    }
    `,
        },
      },
    },
  };
};

export const StringTree = () => {
  return {
    content:
      "Strings are sequences of characters used to store and manipulate text. They are essential for processing and analyzing textual data. Efficient string manipulation techniques are crucial in various programming tasks.",
    code: `
      def reverse_string(s):
          return s[::-1]
        `,
    "Longest/Shortest Subsequence": {
      content:
        "Techniques for finding the longest or shortest subsequences in strings are vital for many applications. These methods help in comparing strings and finding common patterns efficiently.",
      code: `
      def longest_common_subsequence(text1, text2):
          memo = {}
          
          def dp(i, j):
              if i == len(text1) or j == len(text2):
                  return 0
              if (i, j) in memo:
                  return memo[(i, j)]
              if text1[i] == text2[j]:
                  memo[(i, j)] = 1 + dp(i + 1, j + 1)
              else:
                  memo[(i, j)] = max(dp(i + 1, j), dp(i, j + 1))
              return memo[(i, j)]
          
          return dp(0, 0)
          `,
      "Dynamic Programming": {
        content:
          "Dynamic programming is used to solve subsequence problems by breaking them down into simpler subproblems and storing their solutions. This method helps optimize the overall time complexity.",
        code: `
      def longest_common_subsequence(text1, text2):
          dp = [[0] * (len(text2) + 1) for _ in range(len(text1) + 1)]
          
          for i in range(len(text1) - 1, -1, -1):
              for j in range(len(text2) - 1, -1, -1):
                  if text1[i] == text2[j]:
                      dp[i][j] = 1 + dp[i + 1][j + 1]
                  else:
                      dp[i][j] = max(dp[i + 1][j], dp[i][j + 1])
          
          return dp[0][0]
            `,
        Memoization: {
          content:
            "Memoization stores intermediate results to optimize recursive solutions, reducing redundant computations and improving efficiency.",
          code: `
      def longest_common_subsequence(text1, text2):
          memo = {}
          
          def dp(i, j):
              if i == len(text1) or j == len(text2):
                  return 0
              if (i, j) in memo:
                  return memo[(i, j)]
              if text1[i] == text2[j]:
                  memo[(i, j)] = 1 + dp(i + 1, j + 1)
              else:
                  memo[(i, j)] = max(dp(i + 1, j), dp(i, j + 1))
              return memo[(i, j)]
          
          return dp(0, 0)
                `,
          "Depth First Search": {
            content:
              "Depth First Search (DFS) with memoization helps solve problems involving subsequences by storing intermediate results. This approach significantly reduces the time complexity of recursive solutions.",
            code: `
      def dfs_with_memoization(s, memo={}):
          if not s:
              return 0
          if s in memo:
              return memo[s]
          count = 1 + dfs_with_memoization(s[1:], memo)
          memo[s] = count
          return count
                  `,
          },
          "Hash Map": {
            content:
              "Using Hash Maps in memoization helps store computed values efficiently, avoiding redundant calculations and optimizing time complexity.",
            code: `
      def fibonacci(n, memo={}):
          if n in memo:
              return memo[n]
          if n <= 1:
              return n
          memo[n] = fibonacci(n - 1, memo) + fibonacci(n - 2, memo)
          return memo[n]
                  `,
          },
        },
        Tabulation: {
          content:
            "Tabulation builds solutions iteratively using a table (array/matrix), providing a bottom-up approach to dynamic programming problems.",
          code: `
      def longest_common_subsequence(text1, text2):
          dp = [[0] * (len(text2) + 1) for _ in range(len(text1) + 1)]
          
          for i in range(len(text1) - 1, -1, -1):
              for j in range(len(text2) - 1, -1, -1):
                  if text1[i] == text2[j]:
                      dp[i][j] = 1 + dp[i + 1][j + 1]
                  else:
                      dp[i][j] = max(dp[i + 1][j], dp[i][j + 1])
          
          return dp[0][0]
                `,
          "Arrays/Matrix": {
            content:
              "Dynamic Programming with tabulation uses arrays/matrices to build solutions iteratively. This method is ideal for solving problems involving subsequences and provides a systematic approach.",
            code: `
      def coin_change(coins, amount):
          dp = [float('inf')] * (amount + 1)
          dp[0] = 0
          for coin in coins:
              for x in range(coin, amount + 1):
                  dp[x] = min(dp[x], dp[x - coin] + 1)
          return dp[amount] if dp[amount] != float('inf') else -1
                  `,
          },
        },
      },
    },
    "Counting + Frequency": {
      content:
        "Counting character frequencies in strings is crucial for various tasks such as anagram detection and frequency sorting. Efficient frequency counting can be achieved using Hash Maps.",
      code: `
      from collections import Counter
      
      def count_character_frequencies(s):
          return Counter(s)
            `,
      "Hash Map": {
        content:
          "Hash Maps efficiently count character frequencies in strings, making them useful for problems like anagrams or frequency sorting with O(n) time complexity.",
        code: `
      from collections import Counter
      
      def count_character_frequencies(s):
          return Counter(s)
              `,
      },
    },
    "Matching Prefix/Suffix": {
      content:
        "Techniques for matching prefixes and suffixes in strings are essential for tasks like autocomplete and pattern searching. Tries are often used to handle such problems efficiently.",
      code: `
      class TrieNode:
          def __init__(self):
              self.children = {}
              self.is_end_of_word = False
      
      class Trie:
          def __init__(self):
              self.root = TrieNode()
      
          def insert(self, word):
              node = self.root
              for char in word:
                  if char not in node.children:
                      node.children[char] = TrieNode()
                  node = node.children[char]
              node.is_end_of_word = True
      
          def search(self, word):
              node = self.root
              for char in word:
                  if char not in node.children:
                      return False
                  node = node.children[char]
              return node.is_end_of_word
      
          def starts_with(self, prefix):
              node = self.root
              for char in prefix:
                  if char not in node.children:
                      return False
                  node = node.children[char]
              return True
            `,
      Trie: {
        content:
          "Using the Trie data structure for efficient prefix and suffix matching allows for fast insertions and lookups, making it ideal for autocomplete and dictionary applications.",
        code: `
      class TrieNode:
          def __init__(self):
              self.children = {}
              self.is_end_of_word = False
      
      class Trie:
          def __init__(self):
              self.root = TrieNode()
      
          def insert(self, word):
              node = self.root
              for char in word:
                  if char not in node.children:
                      node.children[char] = TrieNode()
                  node = node.children[char]
              node.is_end_of_word = True
      
          def search(self, word):
              node = self.root
              for char in word:
                  if char not in node.children:
                      return False
                  node = node.children[char]
              return node.is_end_of_word
      
          def starts_with(self, prefix):
              node = self.root
              for char in prefix:
                  if char not in node.children):
                      return False
                  node = node.children[char]
              return True
              `,
        "Hash Map": {
          content:
            "Combining Tries with Hash Maps enhances prefix and suffix matching efficiency. This combination supports advanced features like autocomplete and predictive text.",
          code: `
      class TrieNode:
          def __init__(self):
              self.children = {}
              self.is_end_of_word = False
      
      class Trie:
          def __init__(self):
              self.root = TrieNode()
      
          def insert(self, word):
              node = self.root
              for char in word:
                  if char not in node.children:
                      node.children[char] = TrieNode()
                  node = node.children[char]
              node.is_end_of_word = True
      
          def search(self, word):
              node = self.root
              for char in word:
                  if char not in node.children:
                      return False
                  node = node.children[char]
              return node.is_end_of_word
      
          def starts_with(self, prefix):
              node = self.root
              for char in prefix):
                  if char not in node.children:
                      return False
                  node = node.children[char]
              return True
                `,
        },
        "BFS/DFS": {
          content:
            "Breadth-First Search (BFS) and Depth-First Search (DFS) in Tries traverse the structure to find matching prefixes or suffixes. These methods are useful in word search and autocomplete problems.",
          code: `
      from collections import deque
      
      def bfs_trie(root):
          queue = deque([root])
          while queue:
              node = queue.popleft()
              for child in node.children.values():
                  queue.append(child)
      
      def dfs_trie(root):
          stack = [root]
          while stack:
              node = stack.pop()
              for child in node.children.values():
                  stack.append(child)
              `,
        },
      },
    },
    "Connected Words": {
      content:
        "Techniques for finding connected words in strings are crucial for tasks like word ladders and transformation sequences. Graph-based approaches are commonly used to solve such problems.",
      code: `
      from collections import deque
      
      def bfs_word_ladder(begin_word, end_word, word_list):
          word_set = set(word_list)
          queue = deque([(begin_word, 1)])
          while queue:
              current_word, steps = queue.popleft()
              if current_word == end_word:
                  return steps
              for i in range(len(current_word)):
                  for char in 'abcdefghijklmnopqrstuvwxyz':
                      next_word = current_word[:i] + char + current_word[i+1:]
                      if next_word in word_set:
                          word_set.remove(next_word)
                          queue.append((next_word, steps + 1))
          return 0
      
      def dfs_word_ladder(begin_word, end_word, word_list):
          word_set = set(word_list)
          stack = [(begin_word, 1)]
          while stack:
              current_word, steps = stack.pop()
              if current_word == end_word:
                  return steps
              for i in range(len(current_word)):
                  for char in 'abcdefghijklmnopqrstuvwxyz':
                      next_word = current_word[:i] + char + current_word[i+1:]
                      if next_word in word_set:
                          word_set.remove(next_word)
                          stack.append((next_word, steps + 1))
          return 0
            `,
      Graph: {
        content:
          "Using graph techniques to find connected words, such as in word ladders and transformation sequences. These techniques help explore relationships between words effectively.",
        code: `
      from collections import deque
      
      def bfs_word_ladder(begin_word, end_word, word_list):
          word_set = set(word_list)
          queue = deque([(begin_word, 1)])
          while queue:
              current_word, steps = queue.popleft()
              if current_word == end_word:
                  return steps
              for i in range(len(current_word)):
                  for char in 'abcdefghijklmnopqrstuvwxyz':
                      next_word = current_word[:i] + char + current_word[i+1:]
                      if next_word in word_set:
                          word_set.remove(next_word)
                          queue.append((next_word, steps + 1))
          return 0
      
      def dfs_word_ladder(begin_word, end_word, word_list):
          word_set = set(word_list)
          stack = [(begin_word, 1)]
          while stack:
              current_word, steps = stack.pop()
              if current_word == end_word:
                  return steps
              for i in range(len(current_word)):
                  for char in 'abcdefghijklmnopqrstuvwxyz':
                      next_word = current_word[:i] + char + current_word[i+1:]
                      if next_word in word_set:
                          word_set.remove(next_word)
                          stack.append((next_word, steps + 1))
          return 0
              `,
        "BFS/DFS": {
          content:
            "Graphs with Breadth-First Search (BFS) and Depth-First Search (DFS) traverse word ladders or transformation sequences. These techniques are ideal for problems requiring exploration of word connections and transformations.",
          code: `
      from collections import deque
      
      def bfs_word_ladder(begin_word, end_word, word_list):
          word_set = set(word_list)
          queue = deque([(begin_word, 1)])
          while queue:
              current_word, steps = queue.popleft()
              if current_word == end_word:
                  return steps
              for i in range(len(current_word)):
                  for char in 'abcdefghijklmnopqrstuvwxyz':
                      next_word = current_word[:i] + char + current_word[i+1:]
                      if next_word in word_set:
                          word_set.remove(next_word)
                          queue.append((next_word, steps + 1))
          return 0
      
      def dfs_word_ladder(begin_word, end_word, word_list):
          word_set = set(word_list)
          stack = [(begin_word, 1)]
          while stack:
              current_word, steps = stack.pop()
              if current_word == end_word:
                  return steps
              for i in range(len(current_word)):
                  for char in 'abcdefghijklmnopqrstuvwxyz':
                      next_word = current_word[:i] + char + current_word[i+1:]
                      if next_word in word_set:
                          word_set.remove(next_word)
                          stack.append((next_word, steps + 1))
          return 0
                `,
        },
      },
    },
    "Perform Reversal": {
      content:
        "Techniques for reversing strings are essential for various applications such as palindrome checking and data manipulation. Efficient string reversal can be achieved using different approaches.",
      code: `
      def reverse_string(s):
          return s[::-1]
            `,
      "Two Pointers": {
        content:
          "Using Two Pointers in string reversal helps efficiently reverse parts or entire strings with O(1) space. This method is common in in-place transformation problems.",
        code: `
      def reverse_string(s):
          left, right = 0, len(s) - 1
          s = list(s)
          while left < right:
              s[left], s[right] = s[right], s[left]
              left += 1
              right -= 1
          return ''.join(s)
              `,

        "Fast & Slow Pointers": {
          content:
            "Fast & Slow Pointers in strings are used for tasks like finding the middle of a string or checking palindromes. This technique optimizes the number of traversals needed.",
          code: `
      def is_palindrome(s):
          left, right = 0, len(s) - 1
          while left < right:
              if s[left] != s[right]:
                  return False
              left += 1
              right -= 1
          return True
                  `,
        },
      },
    },
    "Cycle Detection": {
      content:
        "Detecting cycles in strings is crucial to prevent infinite loops in algorithms. Techniques like Fast & Slow Pointers (Floyd's Tortoise and Hare) are commonly used for this purpose.",
      code: `
      def detect_cycle(head):
          slow, fast = head, head
          while fast and fast.next:
              slow = slow.next
              fast = fast.next.next
              if slow == fast:
                  return True
          return False
            `,
      "Fast & Slow Pointers": {
        content:
          "Fast & Slow Pointers (Floyd's Tortoise and Hare) are the go-to technique for detecting cycles in character sequences. This method is useful for problems involving repeated patterns or infinite loops.",
        code: `
      def detect_cycle(head):
          slow, fast = head, head
          while fast and fast.next:
              slow = slow.next
              fast = fast.next.next
              if slow == fast:
                  return True
          return False
              `,
      },
    },
    "Find Longest/Shortest Continuous Portion": {
      content:
        "Techniques for finding the longest or shortest continuous portions in strings are useful for problems involving substrings and subsequences. These methods help in optimizing searches and computations.",
      code: `
      def length_of_longest_substring(s):
          char_set = set()
          l = 0
          result = 0
          for r in range(len(s)):
              while s[r] in char_set:
                  char_set.remove(s[l])
                  l += 1
              char_set.add(s[r])
              result = max(result, r - l + 1)
          return result
            `,
      "Sliding Window": {
        content:
          "Using the sliding window technique in strings allows for efficient searching of substrings and subsequences. This method is particularly useful in problems involving unique elements or specific patterns.",
        code: `
      def length_of_longest_substring(s):
          char_set = set()
          l = 0
          result = 0
          for r in range(len(s)):
              while s[r] in char_set:
                  char_set.remove(s[l])
                  l += 1
              char_set.add(s[r])
              result = max(result, r - l + 1)
          return result
              `,
        "Hash Map/Set": {
          content:
            "Sliding Window with Hash Map/Set helps find the longest or shortest substrings with unique or specific characters efficiently. This technique provides O(n) time complexity.",
          code: `
      def length_of_longest_substring(s):
          char_set = set()
          l = 0
          result = 0
          for r in range(len(s)):
              while s[r] in char_set:
                  char_set.remove(s[l])
                  l += 1
              char_set.add(s[r])
              result = max(result, r - l + 1)
          return result
                `,
        },
      },
    },
  };
};

export const ArrayTree = () => {
  return {
    content:
      "Arrays are versatile data structures that efficiently store collections of elements. They are widely used for their ability to provide fast access and modification of data. Mastery of array operations is fundamental for solving complex algorithmic problems.",
    code: `
          def sum_array(arr):
              return sum(arr)
          `,
    "Perform Reversal": {
      content:
        "Array reversal techniques are essential for tasks like inverting data sequences or preparing data structures for specific algorithms. These methods ensure that data is manipulated correctly and efficiently. Understanding different reversal methods enhances problem-solving skills.",
      code: `
          def reverse_array(arr):
              return arr[::-1]
          `,
      "Two Pointers": {
        content:
          "The Two Pointers technique is an efficient way to reverse arrays in-place, using minimal extra space. It involves swapping elements from both ends towards the center, ensuring the array is reversed in linear time. This method is simple yet powerful in many algorithmic contexts.",
        code: `
          def reverse_with_two_pointers(arr):
              left, right = 0, len(arr) - 1
              while left < right:
                  arr[left], arr[right] = arr[right], arr[left]
                  left += 1
                  right -= 1
              return arr
              `,
        "Fast & Slow Pointers": {
          content:
            "The Fast & Slow Pointers approach is useful for detecting cycles or finding the middle of an array. It leverages two pointers moving at different speeds, providing a straightforward method to analyze and traverse arrays. This technique is crucial for many advanced algorithmic problems.",
          code: `
          def find_middle_with_pointers(arr):
              slow, fast = 0, 0
              while fast < len(arr) - 1 and fast + 1 < len(arr):
                  slow += 1
                  fast += 2
              return arr[slow]
                  `,
        },
      },
    },
    "Cycle Detection": {
      content:
        "Detecting cycles in arrays helps prevent infinite loops in algorithms. Techniques like Floyd's Tortoise and Hare are commonly employed for this purpose, ensuring that operations on arrays are both safe and efficient. Effective cycle detection is key to solving many computational problems.",
      code: `
          def detect_cycle_in_array(arr):
              slow, fast = 0, 0
              while fast < len(arr) - 1 and fast + 1 < len(arr):
                  slow += 1
                  fast += 2
                  if arr[slow] == arr[fast]:
                      return True
              return False
            `,
      "Fast & Slow Pointers": {
        content:
          "Fast & Slow Pointers are a standard technique to detect cycles in linked structures, allowing for efficient identification of repeating sequences. This method is particularly useful in problems involving linked lists and other sequential data structures. Mastery of this technique is essential for advanced algorithm design.",
        code: `
          def detect_cycle_fast_slow(arr):
              slow, fast = 0, 0
              while fast < len(arr) - 1 and fast + 1 < len(arr):
                  slow += 1
                  fast += 2
                  if arr[slow] == arr[fast]:
                      return True
              return False
              `,
      },
    },
    "Find Longest/Shortest Continuous Portion": {
      content:
        "Methods to find the longest or shortest continuous portions of an array are crucial for substring and subarray problems. These techniques help in efficient data analysis and are used in various applications like pattern recognition and sequence analysis. Mastering these methods improves problem-solving abilities in computational tasks.",
      code: `
          def longest_continuous_subarray(arr):
              max_len = 0
              current_len = 0
              for i in range(len(arr)):
                  if i == 0 or arr[i] == arr[i - 1] + 1:
                      current_len += 1
                      max_len = max(max_len, current_len)
                  else:
                      current_len = 1
              return max_len
            `,
      "Sliding Window": {
        content:
          "The Sliding Window technique efficiently solves problems related to subarrays or substrings by maintaining a window of elements and sliding it across the array. This approach is highly effective for problems involving continuous sequences and helps in optimizing time complexity. It is widely used in various real-world applications.",
        code: `
          def sliding_window_sum(arr, k):
              max_sum = 0
              window_sum = sum(arr[:k])
              for i in range(len(arr) - k):
                  window_sum += arr[i + k] - arr[i]
                  max_sum = max(max_sum, window_sum)
              return max_sum
              `,
        "Hash Map/Set": {
          content:
            "Combining Sliding Window with Hash Map/Set enhances the efficiency of finding unique elements in subarrays, providing a linear time complexity solution. This combination is particularly useful for problems requiring quick lookups and dynamic updates. It is a powerful tool in the arsenal of algorithmic techniques.",
          code: `
          def longest_unique_subarray(arr):
              seen = set()
              left = 0
              max_len = 0
              for right in range(len(arr)):
                  while arr[right] in seen:
                      seen.remove(arr[left])
                      left += 1
                  seen.add(arr[right])
                  max_len = max(max_len, right - left + 1)
              return max_len
                `,
        },
      },
    },
    "Count Ways/Possibilities": {
      content:
        "Counting the number of ways or possibilities in arrays is vital for combinatorial problems. Techniques include dynamic programming and recursive approaches to efficiently solve these problems. These methods are essential for solving complex algorithmic challenges in fields like operations research and computer science.",
      code: `
          def count_ways_to_reach_n(n):
              if n == 0:
                  return 1
              if n < 0:
                  return 0
              return count_ways_to_reach_n(n - 1) + count_ways_to_reach_n(n - 2)
            `,
      "Dynamic Programming": {
        content:
          "Dynamic programming breaks down problems into simpler subproblems and solves them systematically, making it ideal for counting possibilities in arrays. This method optimizes computation by storing intermediate results, significantly improving efficiency. It is a cornerstone technique in algorithm design.",
        code: `
          def count_ways_dp(n):
              dp = [0] * (n + 1)
              dp[0] = 1
              for i in range(1, n + 1):
                  dp[i] += dp[i - 1]
                  if i > 1:
                      dp[i] += dp[i - 2]
              return dp[n]
              `,
        Memoization: {
          content:
            "Memoization stores the results of expensive function calls and reuses them, which helps in reducing the time complexity of recursive algorithms. This technique is especially useful for problems with overlapping subproblems. It enhances performance and efficiency in solving complex recursive problems.",
          code: `
          def count_ways_memo(n, memo={}):
              if n in memo:
                  return memo[n]
              if n == 0:
                  return 1
              if n < 0:
                  return 0
              memo[n] = count_ways_memo(n - 1, memo) + count_ways_memo(n - 2, memo)
              return memo[n]
                `,
          "Hash Map": {
            content:
              "Using Hash Maps in memoization helps store intermediate results, optimizing the recursive solutions by preventing redundant computations. This technique leverages the fast lookup capabilities of hash maps, significantly speeding up the algorithm. It is a practical approach for enhancing recursive algorithms.",
            code: `
          def fibonacci(n, memo={}):
              if n in memo:
                  return memo[n]
              if n <= 1:
                  return n
              memo[n] = fibonacci(n - 1, memo) + fibonacci(n - 2, memo)
              return memo[n]
                `,
          },
        },
        Tabulation: {
          content:
            "Tabulation builds solutions iteratively using arrays or matrices, providing a bottom-up approach that is efficient for dynamic programming problems. This method avoids the overhead of recursive calls, making it suitable for large-scale problems. It is a fundamental technique for optimizing dynamic programming solutions.",
          code: `
          def count_ways_tabulation(n):
              dp = [0] * (n + 1)
              dp[0] = 1
              for i in range(1, n + 1):
                  dp[i] += dp[i - 1]
                  if i > 1:
                      dp[i] += dp[i - 2]
              return dp[n]
                `,
          "Arrays/Matrix": {
            content:
              "Dynamic Programming with arrays or matrices through tabulation helps in solving problems efficiently by iteratively building solutions, ideal for subsequence problems. This approach ensures that all subproblems are solved systematically, providing optimal solutions. It is a robust technique for complex algorithmic challenges.",
            code: `
          def min_coin_change(coins, amount):
              dp = [float('inf')] * (amount + 1)
              dp[0] = 0
              for coin in coins:
                  for x in range(coin, amount + 1):
                      dp[x] = min(dp[x], dp[x - coin] + 1)
              return dp[amount] if dp[amount] != float('inf') else -1
                `,
          },
        },
      },
    },
    "Multiple Sub-Array Sum Calculations": {
      content:
        "Calculating multiple sub-array sums efficiently is essential for tasks like finding maximum subarray sums or solving range sum queries. These techniques are crucial for data analysis and optimization problems. Mastery of these methods enhances the ability to tackle complex algorithmic challenges.",
      code: `
          def max_sum_subarray(arr, k):
              max_sum = float('-inf')
              current_sum = 0
              for i in range(len(arr)):
                  current_sum += arr[i]
                  if i >= k - 1:
                      max_sum = max(max_sum, current_sum)
                      current_sum -= arr[i - (k - 1)]
              return max_sum
            `,
      "Prefix Sum": {
        content:
          "Prefix sums precompute cumulative sums of arrays, allowing for efficient range sum queries and solving subarray problems. This technique simplifies complex calculations by converting them into simple array lookups. It is a powerful tool for optimizing algorithmic solutions.",
        code: `
          def prefix_sum(arr):
              prefix = [0] * (len(arr) + 1)
              for i in range(len(arr)):
                  prefix[i + 1] = prefix[i] + arr[i]
              return prefix
          
          def range_sum(prefix, i, j):
              return prefix[j + 1] - prefix[i]
            `,
        Arrays: {
          content:
            "Using arrays to store prefix sums helps in efficiently solving range sum queries and optimizing subarray sum calculations. This approach reduces the time complexity of range queries, making it highly efficient. It is a fundamental technique in data analysis and computational geometry.",
          code: `
          def prefix_sum_arrays(arr):
              prefix = [0] * (len(arr) + 1)
              for i in range(len(arr)):
                  prefix[i + 1] = prefix[i] + arr[i]
              return prefix
          
          def range_sum_with_arrays(prefix, i, j):
              return prefix[j + 1] - prefix[i]
                `,
        },
      },
    },
    "Permutations/Combinations": {
      content:
        "Techniques for generating permutations or combinations in arrays are useful in solving combinatorial problems and exploring all possible arrangements. These methods are vital for tasks involving probability, statistics, and optimization. Mastery of these techniques provides a strong foundation for algorithmic problem-solving.",
      code: `
          def generate_permutations(arr):
              def backtrack(start):
                  if start == len(arr):
                      result.append(arr[:])
                  for i in range(start, len(arr)):
                      arr[start], arr[i] = arr[i], arr[start]
                      backtrack(start + 1)
                      arr[start], arr[i] = arr[i], arr[start]
              result = []
              backtrack(0)
              return result
            `,
      Backtracking: {
        content:
          "Using backtracking to generate permutations or combinations involves exploring all possible arrangements systematically. This technique is powerful for solving constraint satisfaction problems, ensuring all potential solutions are considered. It is a key method in the field of combinatorial optimization.",
        code: `
          def backtrack_combinations(arr, k):
              def backtrack(start, path):
                  if len(path) == k:
                      result.append(path[:])
                      return
                  for i in range(start, len(arr)):
                      path.append(arr[i])
                      backtrack(i + 1, path)
                      path.pop()
              result = []
              backtrack(0, [])
              return result
              `,
        Recursion: {
          content:
            "Backtracking with recursion explores all possible permutations or combinations in a search space. This method is useful in constraint satisfaction problems, providing a systematic way to find solutions. It is a crucial technique for tackling complex algorithmic challenges.",
          code: `
          def recursive_permutations(arr):
              def permute(path, used, res):
                  if len(path) == len(arr):
                      res.append(path[:])
                      return
                  for i, num in enumerate(arr):
                      if not used[i]:
                          used[i] = True
                          path.append(num)
                          permute(path, used, res)
                          path.pop()
                          used[i] = False
              res = []
              permute([], [False] * len(arr), res)
              return res
                `,
        },
      },
    },
    Sorting: {
      content:
        "Techniques for sorting arrays are fundamental in computer science, providing efficient ways to order elements. Sorting algorithms optimize the organization of data, facilitating faster search and retrieval. Mastery of these techniques is essential for solving a wide range of computational problems.",
      code: `
          def bubble_sort(arr):
              n = len(arr)
              for i in range(n):
                  for j in range(0, n-i-1):
                      if arr[j] > arr[j+1]:
                          arr[j], arr[j+1] = arr[j+1], arr[j]
              return arr
            `,
      "Merge Sort": {
        content:
          "Merge Sort is efficient for sorting large arrays due to its O(n log n) time complexity and stability. It’s often used in interview problems requiring efficient and stable sorting algorithms. This method divides the array into halves, recursively sorts them, and merges the sorted halves.",
        code: `
          def merge_sort(arr):
              if len(arr) > 1:
                  mid = len(arr) // 2
                  left_half = arr[:mid]
                  right_half = arr[mid:]
                  merge_sort(left_half)
                  merge_sort(right_half)
                  i = j = k = 0
                  while i < len(left_half) and j < len(right_half):
                      if left_half[i] < right_half[j]:
                          arr[k] = left_half[i]
                          i += 1
                      else:
                          arr[k] = right_half[j]
                          j += 1
                      k += 1
                  while i < len(left_half):
                      arr[k] = left_half[i]
                      i += 1
                      k += 1
                  while j < len(right_half):
                      arr[k] = right_half[j]
                      j += 1
                      k += 1
              return arr
              `,
      },
      Heap: {
        content:
          "Using heap structures for sorting arrays provides an efficient way to manage and retrieve elements. Heaps are binary trees that maintain a specific order property, facilitating quick access to the smallest or largest elements. This technique is widely used in priority queues and scheduling algorithms.",
        code: `
          import heapq
          
          def heap_sort(arr):
              heapq.heapify(arr)
              sorted_arr = [heapq.heappop(arr) for _ in range(len(arr))]
              return sorted_arr
              `,
        "Kth Largest": {
          content:
            "Finding the Kth largest element in an array using a heap is a common problem in algorithm interviews and competitions. This technique involves maintaining a min heap of the K largest elements, providing efficient retrieval of the desired element.",
          code: `
          import heapq
          
          def find_kth_largest(nums, k):
              min_heap = nums[:k]
              heapq.heapify(min_heap)
              for num in nums[k:]:
                  if num > min_heap[0]:
                      heapq.heappushpop(min_heap, num)
              return min_heap[0]
              `,
          "Min Heap": {
            content:
              "Min Heaps efficiently find the Kth largest element by maintaining the smallest K elements. This provides O(n log k) time complexity, making it suitable for large datasets. The technique leverages the properties of heaps to ensure quick and efficient operations.",
            code: `
          import heapq
          
          def find_kth_largest_min_heap(nums, k):
              min_heap = nums[:k]
              heapq.heapify(min_heap)
              for num in nums[k:]:
                  if num > min_heap[0]:
                      heapq.heappushpop(min_heap, num)
              return min_heap[0]
                `,
          },
        },
        "Kth Smallest": {
          content:
            "Finding the Kth smallest element in an array using a heap involves maintaining a max heap. This technique is commonly used in selection problems, ensuring efficient retrieval of the desired element from the array.",
          code: `
          import heapq
          
          def find_kth_smallest(nums, k):
              max_heap = [-num for num in nums[:k]]
              heapq.heapify(max_heap)
              for num in nums[k:]:
                  if num < -max_heap[0]:
                      heapq.heappushpop(max_heap, -num)
              return -max_heap[0]
              `,
          "Max Heap": {
            content:
              "Max Heaps efficiently find the Kth smallest element by maintaining the largest K elements. This provides O(n log k) time complexity, making it suitable for large datasets. The technique leverages the properties of heaps to ensure quick and efficient operations.",
            code: `
          import heapq
          
          def find_kth_smallest_max_heap(nums, k):
              max_heap = [-num for num in nums[:k]]
              heapq.heapify(max_heap)
              for num in nums[k:]:
                  if num < -max_heap[0]:
                      heapq.heappushpop(max_heap, -num)
              return -max_heap[0]
                `,
          },
        },
      },
    },
    "Find Top K Elements": {
      content:
        "Techniques for finding the top K elements in arrays are essential for problems requiring efficient selection and ranking. These methods include heaps, quick select, and built-in sorting functions, each providing unique advantages. Mastery of these techniques is crucial for solving complex selection problems.",
      code: `
          import heapq
          
          def find_top_k_elements(nums, k):
              return heapq.nlargest(k, nums)
            `,
      Heap: {
        content:
          "Using heaps to find the top K elements allows for efficient retrieval and management of the largest or smallest elements. Heaps provide a structured way to handle dynamic data, making them suitable for real-time processing tasks.",
        code: `
          import heapq
          
          def find_top_k_elements_with_heap(nums, k):
              return heapq.nlargest(k, nums)
              `,
        "Kth Largest": {
          content:
            "Finding the Kth largest element using a heap involves maintaining a min heap of the K largest elements. This approach ensures that the smallest element in the heap is the Kth largest in the array.",
          code: `
          import heapq
          
          def find_kth_largest_with_heap(nums, k):
              min_heap = nums[:k]
              heapq.heapify(min_heap)
              for num in nums[k:]:
                  if num > min_heap[0]:
                      heapq.heappushpop(min_heap, num)
              return min_heap[0]
              `,
          "Min Heap": {
            content:
              "Min Heaps efficiently find the Kth largest element by maintaining the smallest K elements. This provides O(n log k) time complexity, making it suitable for large datasets. The technique leverages the properties of heaps to ensure quick and efficient operations.",
            code: `
          import heapq
          
          def find_kth_largest_with_min_heap(nums, k):
              min_heap = nums[:k]
              heapq.heapify(min_heap)
              for num in nums[k:]:
                  if num > min_heap[0]:
                      heapq.heappushpop(min_heap, num)
              return min_heap[0]
                `,
          },
        },
        "Kth Smallest": {
          content:
            "Finding the Kth smallest element using a heap involves maintaining a max heap of the K smallest elements. This technique ensures that the largest element in the heap is the Kth smallest in the array.",
          code: `
          import heapq
          
          def find_kth_smallest_with_heap(nums, k):
              max_heap = [-num for num in nums[:k]]
              heapq.heapify(max_heap)
              for num in nums[k:]:
                  if num < -max_heap[0]:
                      heapq.heappushpop(max_heap, -num)
              return -max_heap[0]
              `,
          "Max Heap": {
            content:
              "Max Heaps efficiently find the Kth smallest element by maintaining the largest K elements. This provides O(n log k) time complexity, making it suitable for large datasets. The technique leverages the properties of heaps to ensure quick and efficient operations.",
            code: `
          import heapq
          
          def find_kth_smallest_with_max_heap(nums, k):
              max_heap = [-num for num in nums[:k]]
              heapq.heapify(max_heap)
              for num in nums[k:]:
                  if num < -max_heap[0]:
                      heapq.heappushpop(max_heap, -num)
              return -max_heap[0]
                `,
          },
        },
      },
      "Quick Select": {
        content:
          "Using Quick Select to find the top K elements involves selecting the Kth smallest or largest elements in linear time on average. This method is highly efficient for large datasets, providing a practical approach to selection problems.",
        code: `
          def quickselect(nums, k):
              def partition(left, right, pivot_index):
                  pivot = nums[pivot_index]
                  nums[pivot_index], nums[right] = nums[right], nums[pivot_index]
                  store_index = left
                  for i in range(left, right):
                      if nums[i] < pivot:
                          nums[store_index], nums[i] = nums[i], nums[store_index]
                          store_index += 1
                  nums[right], nums[store_index] = nums[store_index], nums[right]
                  return store_index
          
              def select(left, right, k_smallest):
                  if left == right:
                      return nums[left]
                  pivot_index = (left + right) // 2
                  pivot_index = partition(left, right, pivot_index)
                  if k_smallest == pivot_index:
                      return nums[k_smallest]
                  elif k_smallest < pivot_index:
                      return select(left, pivot_index - 1, k_smallest)
                  else:
                      return select(pivot_index + 1, right, k_smallest)
          
              return select(0, len(nums) - 1, k - 1)
              `,
        "Built-in Sort": {
          content:
            "Using built-in sort functions to find the top K elements is a straightforward approach that leverages the efficiency of optimized sorting algorithms. This method is simple to implement and highly effective for smaller datasets.",
          code: `
          def find_top_k_elements_with_sort(nums, k):
              return sorted(nums, reverse=True)[:k]
              `,
          "Two Pointers": {
            content:
              "Combining Two Pointers with sorting helps in solving problems involving pairs or triplets that meet specific conditions, optimizing time complexity. This technique is particularly useful for tasks like finding pairs that sum to a target value.",
            code: `
          def two_sum_with_pointers(nums, target):
              nums.sort()
              left, right = 0, len(nums) - 1
              while left < right:
                  current_sum = nums[left] + nums[right]
                  if current_sum == target:
                      return [left, right]
                  elif current_sum < target:
                      left += 1
                  else:
                      right -= 1
              return []
                  `,
            "Binary Search": {
              content:
                "Binary Search on sorted arrays quickly finds elements or insertion points, providing O(log n) time complexity. This method is essential for efficient search operations in large datasets.",
              code: `
          def binary_search(arr, target):
              left, right = 0, len(arr) - 1
              while left <= right:
                  mid = (left + right) // 2
                  if arr[mid] == target:
                      return mid
                  elif arr[mid] < target:
                      left = mid + 1
                  else:
                      right = mid - 1
              return -1
                  `,
            },
          },
        },
      },
    },
    "Intervals [start, end]": {
      content:
        "Techniques for handling intervals in arrays are crucial for tasks like merging overlapping intervals and finding gaps. These methods are essential for scheduling problems, range queries, and other applications that involve intervals. Mastering these techniques provides a robust toolkit for solving interval-related problems.",
      code: `
          def merge_intervals(intervals):
              intervals.sort(key=lambda x: x[0])
              merged = []
              for interval in intervals:
                  if not merged or merged[-1][1] < interval[0]:
                      merged.append(interval)
                  else:
                      merged[-1][1] = max(merged[-1][1], interval[1])
              return merged
            `,
      "Built-in Sort & Merge Intervals": {
        content:
          "Sorting and merging intervals solve problems involving overlapping intervals or range queries, providing efficient solutions with O(n log n) time complexity. This method is widely used in computational geometry and scheduling algorithms.",
        code: `
          def merge_intervals_with_sort(intervals):
              intervals.sort(key=lambda x: x[0])
              merged = []
              for interval in intervals:
                  if not merged or merged[-1][1] < interval[0]:
                      merged.append(interval)
                  else:
                      merged[-1][1] = max(merged[-1][1], interval[1])
              return merged
              `,
      },
    },
    "Search Problem": {
      content:
        "Techniques for solving search problems in arrays are fundamental in computer science. They include methods for finding elements, pairs, or ranges efficiently. Mastery of these techniques is essential for optimizing search operations and solving complex algorithmic problems.",
      code: `
          def linear_search(arr, target):
              for i, value in enumerate(arr):
                  if value == target:
                      return i
              return -1
            `,
      "Is It Sorted?": {
        content:
          "Checking if an array is sorted is a common task that can be solved efficiently. This check is useful for optimizing other algorithms and ensuring data integrity. Efficiently determining if an array is sorted can significantly impact performance in various applications.",
        code: `
          def is_sorted(arr):
              for i in range(1, len(arr)):
                  if arr[i] < arr[i - 1]:
                      return False
              return True
              `,
        No: {
          content:
            "Handling unsorted arrays often requires preprocessing steps such as sorting or using data structures like Hash Maps to optimize searches. These techniques ensure that search operations are efficient and effective, even in large datasets.",
          code: `
          def two_sum_unsorted(nums, target):
              num_map = {}
              for i, num in enumerate(nums):
                  if target - num in num_map:
                      return [num_map[target - num], i]
                  num_map[num] = i
              return []
                `,
          "Hash Map": {
            content:
              "Hash Maps help in searching unsorted arrays by providing O(1) average time complexity for lookups. This method is efficient for problems like finding pairs with a given sum, ensuring quick and reliable search operations.",
            code: `
          def two_sum_with_hash_map(nums, target):
              num_map = {}
              for i, num in enumerate(nums):
                  if target - num in num_map:
                      return [num_map[target - num], i]
                  num_map[num] = i
              return []
                `,
          },
          "Built-in Sort": {
            content:
              "Using built-in sort functions for unsorted arrays helps in preprocessing data for efficient searching and other operations. This approach leverages the power of optimized sorting algorithms to enhance performance.",
            code: `
          def sort_and_two_sum(nums, target):
              nums.sort()
              left, right = 0, len(nums) - 1
              while left < right:
                  current_sum = nums[left] + nums[right]
                  if current_sum == target:
                      return [left, right]
                  elif current_sum < target:
                      left += 1
                  else:
                      right -= 1
              return []
                `,
            "Two Pointers": {
              content:
                "Combining Two Pointers with sorting helps in solving problems involving pairs or triplets that meet specific conditions, optimizing time complexity. This technique is particularly useful for tasks like finding pairs that sum to a target value.",
              code: `
          def find_pair_with_two_pointers(nums, target):
              nums.sort()
              left, right = 0, len(nums) - 1
              while left < right:
                  current_sum = nums[left] + nums[right]
                  if current_sum == target:
                      return [left, right]
                  elif current_sum < target:
                      left += 1
                  else:
                      right -= 1
              return []
                      `,
              "Binary Search": {
                content:
                  "Binary Search on sorted arrays quickly finds elements or insertion points, providing O(log n) time complexity. This method is essential for efficient search operations in large datasets.",
                code: `
          def binary_search_in_sorted(arr, target):
              left, right = 0, len(arr) - 1
              while left <= right:
                  mid = (left + right) // 2
                  if arr[mid] == target:
                      return mid
                  elif arr[mid] < target:
                      left = mid + 1
                  else:
                      right = mid - 1
              return -1
                      `,
              },
            },
          },
        },
        Yes: {
          content:
            "Handling sorted arrays often simplifies problems and allows for more efficient algorithms, such as binary search. Sorted arrays facilitate quicker search operations and provide a foundation for more complex algorithms.",
          code: `
          def binary_search_in_array(arr, target):
              left, right = 0, len(arr) - 1
              while left <= right:
                  mid = (left + right) // 2
                  if arr[mid] == target:
                      return mid
                  elif arr[mid] < target:
                      left = mid + 1
                  else:
                      right = mid - 1
              return -1
                `,
          "Binary Search": {
            content:
              "Binary Search on sorted arrays quickly finds elements or insertion points, providing O(log n) time complexity. This method is essential for efficient search operations in large datasets.",
            code: `
          def binary_search(arr, target):
              left, right = 0, len(arr) - 1
              while left <= right:
                  mid = (left + right) // 2
                  if arr[mid] == target:
                      return mid
                  elif arr[mid] < target:
                      left = mid + 1
                  else:
                      right = mid - 1
              return -1
                  `,
          },
        },
      },
    },
  };
};

export const TreeTree = () => {
  return {
    content:
      "Trees are hierarchical data structures with nodes connected by edges. They are used to represent hierarchical relationships and enable efficient data retrieval and manipulation. Understanding tree structures is fundamental for various applications in computer science, such as databases and file systems.",
    code: `
        class TreeNode:
            def __init__(self, value=0, left=None, right=None):
                self.value = value
                self.left = left
                self.right = right
        
        def inorder_traversal(root):
            if root:
                inorder_traversal(root.left)
                print(root.value)
                inorder_traversal(root.right)
            `,

    "Binary Search Tree": {
      content:
        "Binary Search Trees (BSTs) maintain nodes in a sorted order, enabling efficient searching, insertion, and deletion. Each node has at most two children, with the left child having a smaller value and the right child a larger value. Mastering BST operations is key for optimizing search algorithms.",
      code: `
        class TreeNode:
            def __init__(self, value=0, left=None, right=None):
                self.value = value
                self.left = left
                self.right = right
        
        def search_bst(root, value):
            if not root or root.value == value:
                return root
            if value < root.value:
                return search_bst(root.left, value)
            return search_bst(root.right, value)
            `,
      "Binary Search": {
        content:
          "Binary Search on BSTs quickly finds elements, providing O(log n) time complexity for balanced trees. This efficient searching technique leverages the sorted property of BSTs. It is fundamental for optimizing various search operations in computer science.",
        code: `
        def search_bst(root, value):
            if not root or root.value == value:
                return root
            if value < root.value:
                return search_bst(root.left, value)
            return search_bst(root.right, value)
              `,
      },
      "Traverse in sorted order": {
        content:
          "Traversing a BST in sorted order can be done using in-order traversal, which processes nodes in ascending order. This technique is useful for tasks requiring sorted data. Understanding traversal methods is crucial for effective tree operations.",
        code: `
        def inorder_traversal(root):
            if root:
                inorder_traversal(root.left)
                print(root.value)
                inorder_traversal(root.right)
              `,
        "Depth First Search": {
          content:
            "Depth First Search (DFS) in BSTs is used for in-order, pre-order, and post-order traversals, each serving different purposes. DFS is essential for exploring and manipulating tree structures in depth. It provides various ways to visit all nodes in a tree.",
          code: `
        def dfs_inorder_bst(root):
            if root:
                dfs_inorder_bst(root.left)
                print(root.value)
                dfs_inorder_bst(root.right)
                  `,
          Stack: {
            content:
              "Using a stack for DFS on BSTs helps in inorder traversal, providing elements in sorted order. Stacks are instrumental in managing the traversal state, especially in iterative implementations of DFS. This approach is key for non-recursive tree traversals.",
            code: `
        def inorder_with_stack(root):
            stack, result = [], []
            while stack or root:
                while root:
                    stack.append(root)
                    root = root.left
                root = stack.pop()
                result.append(root.value)
                root = root.right
            return result
                    `,
          },
          "Pre-Order": {
            content:
              "Pre-Order traversal on BSTs processes nodes before their children, useful in tree construction problems. This traversal method is ideal for creating a copy of the tree. Understanding pre-order traversal is essential for tasks that require processing parents before their children.",
            code: `
        def preorder_traversal(root):
            if root:
                print(root.value)
                preorder_traversal(root.left)
                preorder_traversal(root.right)
                    `,
          },
          "In-Order": {
            content:
              "In-Order traversal on BSTs processes nodes in sorted order, useful in problems requiring sorted data. This method is crucial for retrieving elements in ascending order. It is a fundamental technique for algorithms that depend on sorted data.",
            code: `
        def inorder_traversal_bst(root):
            if root:
                inorder_traversal_bst(root.left)
                print(root.value)
                inorder_traversal_bst(root.right)
                    `,
          },
          "Post-Order": {
            content:
              "Post-Order traversal on BSTs processes nodes after their children, useful in tree deletion problems. This traversal method is particularly useful for deleting nodes and freeing memory. Understanding post-order traversal is essential for tasks that require processing children before their parents.",
            code: `
        def postorder_traversal(root):
            if root:
                postorder_traversal(root.left)
                postorder_traversal(root.right)
                print(root.value)
                    `,
          },
        },
      },
    },
    "Binary Tree": {
      content:
        "Binary Trees are hierarchical structures where each node has at most two children. They are used for efficient searching and sorting, and hierarchical data representation. Mastering binary trees is essential for solving many algorithmic problems in computer science.",
      code: `
        class TreeNode:
            def __init__(self, value=0, left=None, right=None):
                self.value = value
                self.left = left
                self.right = right
        
        def inorder_traversal(root):
            if root:
                inorder_traversal(root.left)
                print(root.value)
                inorder_traversal(root.right)
            `,
      "Breadth First Search": {
        content:
          "Breadth First Search (BFS) on binary trees uses a queue to process nodes level by level, useful in level order traversal problems. This method explores nodes layer by layer, ensuring all nodes at the present depth are processed before moving to the next level. BFS is crucial for applications requiring a broad view of the tree structure.",
        code: `
        from collections import deque
    
        def bfs_binary_tree(root):
            queue = deque([root])
            while queue:
                node = queue.popleft()
                print(node.value)
                if node.left:
                    queue.append(node.left)
                if node.right:
                    queue.append(node.right)
              `,
        Queue: {
          content:
            "Queues in BFS store nodes level-wise, ensuring correct order and efficient traversal. By using a queue, BFS can systematically explore each level of the tree before moving to the next. This method is essential for level-order traversal and other layer-wise operations.",
          code: `
        from collections import deque
    
        def level_order_traversal_binary_tree(root):
            result = []
            if not root:
                return result
            queue = deque([root])
            while queue:
                level_size = len(queue)
                level = []
                for _ in range(level_size):
                    node = queue.popleft()
                    level.append(node.value)
                    if node.left:
                        queue.append(node.left)
                    if node.right:
                        queue.append(node.right)
                result.append(level)
            return result
                  `,
        },
      },
      "Depth First Search": {
        content:
          "Depth First Search (DFS) on binary trees explores the tree deeply, visiting nodes in pre-order, in-order, or post-order. This method is fundamental for many tree algorithms and provides various ways to visit all nodes. DFS is key for in-depth exploration and manipulation of tree structures.",
        code: `
        def dfs_preorder_binary_tree(root):
            if root:
                print(root.value)
                dfs_preorder_binary_tree(root.left)
                dfs_preorder_binary_tree(root.right)
              `,
        Stack: {
          content:
            "Using a stack for DFS on binary trees helps in traversing the tree in different orders (pre, in, post). Stacks manage the traversal state, especially in iterative implementations of DFS. This approach is crucial for non-recursive tree traversals.",
          code: `
        def dfs_with_stack_binary_tree(root):
            stack, result = [], []
            while stack or root:
                while root:
                    stack.append(root)
                    root = root.left
                root = stack.pop()
                result.append(root.value)
                root = root.right
            return result
                  `,
        },
        "Pre-Order": {
          content:
            "Pre-Order traversal processes nodes before their children, useful in tree construction problems. This traversal method is ideal for creating a copy of the tree. Understanding pre-order traversal is essential for tasks that require processing parents before their children.",
          code: `
        def preorder_traversal_binary_tree(root):
            if root:
                print(root.value)
                preorder_traversal_binary_tree(root.left)
                preorder_traversal_binary_tree(root.right)
                  `,
        },
        "In-Order": {
          content:
            "In-Order traversal processes nodes in sorted order, useful in problems requiring sorted data. This method is crucial for retrieving elements in ascending order. It is a fundamental technique for algorithms that depend on sorted data.",
          code: `
        def inorder_traversal_binary_tree(root):
            if root:
                inorder_traversal_binary_tree(root.left)
                print(root.value)
                inorder_traversal_binary_tree(root.right)
                  `,
        },
        "Post-Order": {
          content:
            "Post-Order traversal processes nodes after their children, useful in tree deletion problems. This traversal method is particularly useful for deleting nodes and freeing memory. Understanding post-order traversal is essential for tasks that require processing children before their parents.",
          code: `
        def postorder_traversal_binary_tree(root):
            if root:
                postorder_traversal_binary_tree(root.left)
                postorder_traversal_binary_tree(root.right)
                print(root.value)
                  `,
        },
      },
    },
    "N-ary Tree": {
      content:
        "N-ary Trees are hierarchical structures where each node can have multiple children. They are used for representing more complex hierarchical data, such as organizational structures and file systems. Mastering N-ary trees is essential for solving complex algorithmic problems that require more flexible tree structures.",
      code: `
        class NaryTreeNode:
            def __init__(self, value=0, children=None):
                self.value = value
                self.children = children if children is not None else []
        
        def preorder_traversal(root):
            if root:
                print(root.value)
                for child in root.children:
                    preorder_traversal(child)
            `,
      "Breadth First Search": {
        content:
          "BFS on N-ary trees uses a queue to process nodes level by level, useful in level order traversal problems. This method explores nodes layer by layer, ensuring all nodes at the present depth are processed before moving to the next level. BFS is crucial for applications requiring a broad view of the tree structure.",
        code: `
        from collections import deque
    
        def bfs_nary_tree(root):
            queue = deque([root])
            while queue:
                node = queue.popleft()
                print(node.value)
                for child in node.children:
                    queue.append(child)
              `,
        Queue: {
          content:
            "Queues in BFS store nodes level-wise, ensuring correct order and efficient traversal. By using a queue, BFS can systematically explore each level of the tree before moving to the next. This method is essential for level-order traversal and other layer-wise operations.",
          code: `
        from collections import deque
    
        def level_order_traversal_nary_tree(root):
            result = []
            if not root:
                return result
            queue = deque([root])
            while queue:
                level_size = len(queue)
                level = []
                for _ in range(level_size):
                    node = queue.popleft()
                    level.append(node.value)
                    for child in node.children:
                        queue.append(child)
                result.append(level)
            return result
                  `,
        },
      },
      "Depth First Search": {
        content:
          "DFS on N-ary trees explores the tree deeply, visiting nodes in pre-order, in-order, or post-order. This method is fundamental for many tree algorithms and provides various ways to visit all nodes. DFS is key for in-depth exploration and manipulation of tree structures.",
        code: `
        def dfs_preorder_nary_tree(root):
            if root:
                print(root.value)
                for child in root.children:
                    dfs_preorder_nary_tree(child)
              `,
        Stack: {
          content:
            "Using a stack for DFS on N-ary trees helps in traversing the tree in different orders (pre, in, post). Stacks manage the traversal state, especially in iterative implementations of DFS. This approach is crucial for non-recursive tree traversals.",
          code: `
        def dfs_with_stack_nary_tree(root):
            stack, result = [root], []
            while stack:
                node = stack.pop()
                if node:
                    result.append(node.value)
                    stack.extend(reversed(node.children))
            return result
                  `,
        },
        "Pre-Order": {
          content:
            "Pre-Order traversal processes nodes before their children, useful in tree construction problems. This traversal method is ideal for creating a copy of the tree. Understanding pre-order traversal is essential for tasks that require processing parents before their children.",
          code: `
        def preorder_traversal_nary_tree(root):
            if root:
                print(root.value)
                for child in root.children:
                    preorder_traversal_nary_tree(child)
                  `,
        },
        "In-Order": {
          content:
            "In-Order traversal processes nodes in sorted order, useful in problems requiring sorted data. This method is crucial for retrieving elements in ascending order. It is a fundamental technique for algorithms that depend on sorted data.",
          code: `
        def inorder_traversal_nary_tree(root):
            if root and root.children:
                for i in range(len(root.children)):
                    inorder_traversal_nary_tree(root.children[i])
                    if i == 0:
                        print(root.value)
            elif root:
                print(root.value)
                  `,
        },
        "Post-Order": {
          content:
            "Post-Order traversal processes nodes after their children, useful in tree deletion problems. This traversal method is particularly useful for deleting nodes and freeing memory. Understanding post-order traversal is essential for tasks that require processing children before their parents.",
          code: `
        def postorder_traversal_nary_tree(root):
            if root:
                for child in root.children:
                    postorder_traversal_nary_tree(child)
                print(root.value)
                  `,
        },
      },
    },
  };
};

export const EdgeListTree = () => {
  return {
    content:
      "Edge lists represent graphs by listing all edges, which is useful for sparse graphs. This method is straightforward and efficient for storing and processing graphs with relatively few edges. Edge lists are particularly advantageous for applications where edge operations are frequent.",
    code: `
        class Graph:
            def __init__(self, edges):
                self.edges = edges
        
            def add_edge(self, u, v):
                self.edges.append((u, v))
        
            def remove_edge(self, u, v):
                self.edges.remove((u, v))
        
        edges = [(0, 1), (1, 2), (2, 0), (2, 3)]
        graph = Graph(edges)
        graph.add_edge(3, 4)
        graph.remove_edge(2, 3)
            `,

    content:
      "Edge lists represent graphs by listing pairs of connected nodes, ideal for sparse graphs. This representation is memory-efficient and straightforward, making it easy to understand and implement. It is particularly useful when the number of edges is much smaller than the number of possible connections.",
    code: `
        class Graph:
            def __init__(self, edges):
                self.edges = edges
        
            def add_edge(self, u, v):
                self.edges.append((u, v))
        
            def remove_edge(self, u, v):
                self.edges.remove((u, v))
        
        edges = [(0, 1), (1, 2), (2, 0), (2, 3)]
        graph = Graph(edges)
        graph.add_edge(3, 4)
        graph.remove_edge(2, 3)
                `,
    "Hash Map": {
      content:
        "Hash Maps help in storing graph edges efficiently, providing quick access and updates. They allow for fast lookups, making it easy to check for the existence of an edge or update the graph structure. This technique is particularly useful for dynamic graph algorithms.",
      code: `
        class Graph:
            def __init__(self):
                self.adj_list = {}
        
            def add_edge(self, u, v):
                if u not in self.adj_list:
                    self.adj_list[u] = []
                self.adj_list[u].append(v)
        
            def remove_edge(self, u, v):
                if u in self.adj_list:
                    self.adj_list[u].remove(v)
        
        graph = Graph()
        graph.add_edge(0, 1)
        graph.add_edge(1, 2)
        graph.add_edge(2, 0)
        graph.remove_edge(1, 2)
                  `,
    },
    Graph: {
      content:
        "Graphs are collections of nodes connected by edges. They can be represented in various ways, including edge lists, adjacency lists, and adjacency matrices. Understanding these representations is crucial for efficiently solving graph-related problems.",
      code: `
        class Graph:
            def __init__(self, edges):
                self.edges = edges
        
            def add_edge(self, u, v):
                self.edges.append((u, v))
        
            def remove_edge(self, u, v):
                self.edges.remove((u, v))
        
        edges = [(0, 1), (1, 2), (2, 0), (2, 3)]
        graph = Graph(edges)
        graph.add_edge(3, 4)
        graph.remove_edge(2, 3)
                `,
      "Explore Components": {
        content:
          "Exploring graph components involves traversing the graph to identify connected subgraphs. This process is essential for understanding the structure and properties of the graph. Techniques like BFS and DFS are commonly used for this purpose.",
        code: `
        class Graph:
            def __init__(self, edges):
                self.edges = edges
                self.adj_list = self.build_adj_list(edges)
        
            def build_adj_list(self, edges):
                adj_list = {}
                for u, v in edges:
                    if u not in adj_list:
                        adj_list[u] = []
                    adj_list[u].append(v)
                return adj_list
        
            def bfs(self, start):
                visited = set()
                queue = [start]
                while queue:
                    node = queue.pop(0)
                    if node not in visited:
                        print(node)
                        visited.add(node)
                        queue.extend(self.adj_list.get(node, []))
        
        edges = [(0, 1), (1, 2), (2, 0), (2, 3)]
        graph = Graph(edges)
        graph.bfs(0)
                  `,
        "Breadth First Search": {
          content:
            "Breadth First Search (BFS) explores graph components level by level, useful in finding the shortest path in unweighted graphs. It uses a queue to manage the exploration process, ensuring that nodes are processed in the order they are discovered.",
          code: `
        from collections import deque
    
        def bfs(graph, start):
            visited = set()
            queue = deque([start])
            while queue:
                node = queue.popleft()
                if node not in visited:
                    print(node)
                    visited.add(node)
                    queue.extend(graph.get(node, []))
        
        graph = {0: [1], 1: [2], 2: [0, 3], 3: []}
        bfs(graph, 0)
                  `,
          Queue: {
            content:
              "Queues are used in BFS to store nodes level-wise, ensuring correct order and efficient traversal. By maintaining the order of discovery, BFS ensures that the shortest path to each node is found in unweighted graphs.",
            code: `
        from collections import deque
    
        def bfs_with_queue(graph, start):
            visited = set()
            queue = deque([start])
            while queue:
                node = queue.popleft()
                if node not in visited:
                    print(node)
                    visited.add(node)
                    queue.extend(graph.get(node, []))
        
        graph = {0: [1], 1: [2], 2: [0, 3], 3: []}
        bfs_with_queue(graph, 0)
                      `,
          },
        },
        "Depth First Search": {
          content:
            "Depth First Search (DFS) explores graph components deeply before backtracking, useful in topological sorting and cycle detection. DFS uses a stack to manage the exploration process, ensuring that each path is explored to its end before moving to the next path.",
          code: `
        def dfs(graph, start, visited=None):
            if visited is None:
                visited = set()
            visited.add(start)
            print(start)
            for next in graph.get(start, []):
                if next not in visited:
                    dfs(graph, next, visited)
        
        graph = {0: [1], 1: [2], 2: [0, 3], 3: []}
        dfs(graph, 0)
                  `,
          Stack: {
            content:
              "DFS uses a stack to explore graph components deeply before backtracking. This approach is particularly useful for tasks like topological sorting and cycle detection, where deep exploration of paths is necessary.",
            code: `
        def dfs_with_stack(graph, start):
            visited = set()
            stack = [start]
            while stack:
                node = stack.pop()
                if node not in visited:
                    print(node)
                    visited.add(node)
                    stack.extend(graph.get(node, []))
        
        graph = {0: [1], 1: [2], 2: [0, 3], 3: []}
        dfs_with_stack(graph, 0)
                    `,
          },
          "Pre-Order": {
            content:
              "Pre-Order traversal processes nodes before their children, useful in exploring all possible paths. This method ensures that the current node is processed before any of its descendants, providing a natural way to explore paths from the root.",
            code: `
        def dfs_preorder(graph, start, visited=None):
            if visited is None:
                visited = set()
            visited.add(start)
            print(start)
            for next in graph.get(start, []):
                if next not in visited:
                    dfs_preorder(graph, next, visited)
        
        graph = {0: [1], 1: [2], 2: [0, 3], 3: []}
        dfs_preorder(graph, 0)
                    `,
          },
          "In-Order": {
            content:
              "In-Order traversal processes nodes between their children, useful in specific tree problems. Although not common in general graphs, in-order traversal is valuable in binary trees and other structured graphs where nodes have a natural left-right relationship.",
            code: `
        def inorder_traversal(tree, node):
            if node:
                inorder_traversal(tree, tree[node][0]) # Left child
                print(node)
                inorder_traversal(tree, tree[node][1]) # Right child
        
        tree = {0: [1, 2], 1: [None, None], 2: [None, 3], 3: [None, None]}
        inorder_traversal(tree, 0)
                    `,
          },
          "Post-Order": {
            content:
              "Post-Order traversal processes nodes after their children, useful in deleting or processing leaf nodes first. This method ensures that all descendants are processed before the current node, making it ideal for cleanup and deletion tasks.",
            code: `
        def dfs_postorder(graph, start, visited=None):
            if visited is None:
                visited = set()
            visited.add(start)
            for next in graph.get(start, []):
                if next not in visited:
                    dfs_postorder(graph, next, visited)
            print(start)
        
        graph = {0: [1], 1: [2], 2: [0, 3], 3: []}
        dfs_postorder(graph, 0)
                    `,
          },
        },
      },
      "Final Ordering": {
        content:
          "Final ordering in graphs is often required for scheduling and organizing tasks. Techniques like topological sorting are used to order nodes based on dependencies, ensuring that each task is completed before its dependent tasks.",
        code: `
        def topological_sort(graph):
            visited = set()
            stack = []
            def dfs(node):
                visited.add(node)
                for next in graph.get(node, []):
                    if next not in visited:
                        dfs(next)
                stack.append(node)
            for node in graph:
                if node not in visited:
                    dfs(node)
            return stack[::-1]
        
        graph = {0: [1], 1: [2], 2: [3], 3: []}
        print(topological_sort(graph))
                `,
        "Topological Sort": {
          content:
            "Topological sort arranges nodes in a linear order based on dependencies. It is essential for scheduling tasks, ensuring that each task is performed only after all its dependencies are complete.",
          code: `
        def topological_sort(graph):
            visited = set()
            stack = []
            def dfs(node):
                visited.add(node)
                for next in graph.get(node, []):
                    if next not in visited:
                        dfs(next)
                stack.append(node)
            for node in graph:
                if node not in visited:
                    dfs(node)
            return stack[::-1]
        
        graph = {0: [1], 1: [2], 2: [3], 3: []}
        print(topological_sort(graph))
                  `,
          "Breadth First Search": {
            content:
              "BFS-based topological sort processes nodes level by level, useful in scheduling tasks. This method uses a queue to manage nodes with no incoming edges, ensuring tasks are scheduled in the correct order.",
            code: `
        from collections import deque, defaultdict
    
        def bfs_topological_sort(graph, num_nodes):
            in_degree = {i: 0 for i in range(num_nodes)}
            for node in graph:
                for neighbor in graph[node]:
                    in_degree[neighbor] += 1
            
            queue = deque([node for node in in_degree if in_degree[node] == 0])
            top_order = []
            
            while queue:
                node = queue.popleft()
                top_order.append(node)
                for neighbor in graph[node]:
                    in_degree[neighbor] -= 1
                    if in_degree[neighbor] == 0:
                        queue.append(neighbor)
            
            if len(top_order) == num_nodes:
                return top_order
            else:
                return []  # Cycle detected
        
        graph = {0: [1, 2], 1: [3], 2: [3], 3: []}
        print(bfs_topological_sort(graph, 4))
                    `,
            Queue: {
              content:
                "Queues in BFS-based topological sort ensure nodes are processed in the correct order. This approach manages nodes with no incoming edges, scheduling tasks efficiently and correctly.",
              code: `
        from collections import deque, defaultdict
    
        def bfs_topological_sort_with_queue(graph, num_nodes):
            in_degree = {i: 0 for i in range(num_nodes)}
            for node in graph:
                for neighbor in graph[node]:
                    in_degree[neighbor] += 1
            
            queue = deque([node for node in in_degree if in_degree[node] == 0])
            top_order = []
            
            while queue:
                node = queue.popleft()
                top_order.append(node)
                for neighbor in graph[node]:
                    in_degree[neighbor] -= 1
                    if in_degree[neighbor] == 0:
                        queue.append(neighbor)
            
            if len(top_order) == num_nodes:
                return top_order
            else:
                return []  # Cycle detected
        
        graph = {0: [1, 2], 1: [3], 2: [3], 3: []}
        print(bfs_topological_sort_with_queue(graph, 4))
                      `,
            },
          },
          "Depth First Search": {
            content:
              "DFS-based topological sort processes nodes deeply, useful in detecting cycles and ordering tasks. This method uses a stack to manage the processing order, ensuring tasks are scheduled based on dependencies.",
            code: `
        def dfs_topological_sort(graph):
            visited = set()
            stack = []
            def dfs(node):
                visited.add(node)
                for next in graph.get(node, []):
                    if next not in visited:
                        dfs(next)
                stack.append(node)
            for node in graph:
                if node not in visited:
                    dfs(node)
            return stack[::-1]
        
        graph = {0: [1], 1: [2], 2: [3], 3: []}
        print(dfs_topological_sort(graph))
                    `,
            Stack: {
              content:
                "Stacks in DFS-based topological sort ensure nodes are processed deeply before backtracking. This approach helps in detecting cycles and scheduling tasks in the correct order.",
              code: `
        def dfs_topological_sort_with_stack(graph):
            visited = set()
            stack = []
            def dfs(node):
                visited.add(node)
                for next in graph.get(node, []):
                    if next not in visited:
                        dfs(next)
                stack.append(node)
            for node in graph:
                if node not in visited:
                    dfs(node)
            return stack[::-1]
        
        graph = {0: [1], 1: [2], 2: [3], 3: []}
        print(dfs_topological_sort_with_stack(graph))
                      `,
            },
            "Pre-Order": {
              content:
                "Pre-Order traversal helps in processing nodes before their dependencies. This method ensures that the current node is processed before any of its descendants, providing a natural way to explore paths from the root.",
              code: `
        def pre_order_topological_sort(graph):
            visited = set()
            stack = []
            def dfs(node):
                visited.add(node)
                stack.append(node)
                for next in graph.get(node, []):
                    if next not in visited:
                        dfs(next)
            for node in graph:
                if node not in visited:
                    dfs(node)
            return stack
        
        graph = {0: [1], 1: [2], 2: [3], 3: []}
        print(pre_order_topological_sort(graph))
                      `,
            },
            "In-Order": {
              content:
                "In-Order traversal helps in processing nodes between their dependencies. Although less common in general graphs, it can be useful in binary trees and specific structured graphs.",
              code: `
        def inorder_traversal_topological(tree, node):
            if node:
                inorder_traversal_topological(tree, tree[node][0]) # Left child
                print(node)
                inorder_traversal_topological(tree, tree[node][1]) # Right child
        
        tree = {0: [1, 2], 1: [None, None], 2: [None, 3], 3: [None, None]}
        inorder_traversal_topological(tree, 0)
                      `,
            },
            "Post-Order": {
              content:
                "Post-Order traversal helps in processing nodes after their dependencies. This method ensures that all descendants are processed before the current node, making it ideal for cleanup and deletion tasks.",
              code: `
        def post_order_topological_sort(graph):
            visited = set()
            stack = []
            def dfs(node):
                visited.add(node)
                for next in graph.get(node, []):
                    if next not in visited:
                        dfs(next)
                stack.append(node)
            for node in graph:
                if node not in visited:
                    dfs(node)
            return stack[::-1]
        
        graph = {0: [1], 1: [2], 2: [3], 3: []}
        print(post_order_topological_sort(graph))
                      `,
            },
          },
        },
      },
      "Find Shortest Path": {
        content:
          "Finding the shortest path in a graph is crucial for many applications, such as navigation and network optimization. Depending on whether the graph has weighted edges, different algorithms like BFS or Dijkstra's can be used.",
        code: `
        def bfs_shortest_path(graph, start, end):
            from collections import deque
            queue = deque([(start, [start])])
            while queue:
                (node, path) = queue.popleft()
                for next in graph[node] - set(path):
                    if next == end:
                        return path + [next]
                    else:
                        queue.append((next, path + [next]))
            return None
        
        graph = {0: {1, 2}, 1: {0, 3}, 2: {0, 3}, 3: {1, 2}}
        print(bfs_shortest_path(graph, 0, 3))
                `,
        "Weighted Edges?": {
          No: {
            content:
              "For unweighted graphs, BFS is typically used to find the shortest path. This algorithm ensures that the shortest path in terms of the number of edges is found efficiently.",
            code: `
        from collections import deque
    
        def bfs_shortest_path_unweighted(graph, start, end):
            queue = deque([(start, [start])])
            while queue:
                node, path = queue.popleft()
                for next in graph[node] - set(path):
                    if next == end:
                        return path + [next]
                    else:
                        queue.append((next, path + [next]))
            return None
        
        graph = {0: {1, 2}, 1: {0, 3}, 2: {0, 3}, 3: {1, 2}}
        print(bfs_shortest_path_unweighted(graph, 0, 3))
                    `,
            "Breadth First Search": {
              content:
                "BFS finds the shortest path in unweighted graphs by exploring level by level. This method guarantees that the shortest path in terms of the number of edges is found efficiently.",
              code: `
        from collections import deque
    
        def bfs_shortest_path_level(graph, start, end):
            queue = deque([(start, [start])])
            while queue:
                node, path = queue.popleft()
                for next in graph[node] - set(path):
                    if next == end:
                        return path + [next]
                    else:
                        queue.append((next, path + [next]))
            return None
        
        graph = {0: {1, 2}, 1: {0, 3}, 2: {0, 3}, 3: {1, 2}}
        print(bfs_shortest_path_level(graph, 0, 3))
                      `,
              Queue: {
                content:
                  "Using a queue in BFS ensures nodes are processed in the correct order. This approach helps in finding the shortest path in unweighted graphs by exploring each level fully before moving to the next.",
                code: `
        from collections import deque
    
        def bfs_with_queue_shortest_path(graph, start, end):
            queue = deque([(start, [start])])
            while queue:
                node, path = queue.popleft()
                for next in graph[node] - set(path):
                    if next == end:
                        return path + [next]
                    else:
                        queue.append((next, path + [next]))
            return None
        
        graph = {0: {1, 2}, 1: {0, 3}, 2: {0, 3}, 3: {1, 2}}
        print(bfs_with_queue_shortest_path(graph, 0, 3))
                        `,
              },
            },
          },
          Yes: {
            content:
              "For weighted graphs, Dijkstra's algorithm is typically used to find the shortest path. This algorithm ensures that the shortest path in terms of the total weight is found efficiently.",
            code: `
        import heapq
    
        def dijkstra(graph, start):
            heap = [(0, start)]
            distances = {node: float('inf') for node in graph}
            distances[start] = 0
            while heap:
                current_distance, current_node = heapq.heappop(heap)
                if current_distance > distances[current_node]:
                    continue
                for neighbor, weight in graph[current_node]:
                    distance = current_distance + weight
                    if distance < distances[neighbor]:
                        distances[neighbor] = distance
                        heapq.heappush(heap, (distance, neighbor))
            return distances
        
        graph = {
            0: [(1, 2), (2, 4)],
            1: [(2, 1), (3, 7)],
            2: [(3, 3)],
            3: []
        }
        print(dijkstra(graph, 0))
                    `,
            "Dijkstra's Shortest Path": {
              content:
                "Dijkstra's algorithm uses a min heap to find the shortest path in weighted graphs efficiently. It ensures that the shortest path in terms of the total weight is found by exploring the closest nodes first.",
              code: `
        import heapq
    
        def dijkstra_shortest_path(graph, start):
            heap = [(0, start)]
            distances = {node: float('inf') for node in graph}
            distances[start] = 0
            while heap:
                current_distance, current_node = heapq.heappop(heap)
                if current_distance > distances[current_node]:
                    continue
                for neighbor, weight in graph[current_node]:
                    distance = current_distance + weight
                    if distance < distances[neighbor]:
                        distances[neighbor] = distance
                        heapq.heappush(heap, (distance, neighbor))
            return distances
        
        graph = {
            0: [(1, 2), (2, 4)],
            1: [(2, 1), (3, 7)],
            2: [(3, 3)],
            3: []
        }
        print(dijkstra_shortest_path(graph, 0))
                      `,
              "Min Heap": {
                content:
                  "Min Heaps in Dijkstra's algorithm help manage the nodes to be processed based on their current shortest distance. This data structure ensures efficient retrieval and update of nodes, optimizing the shortest path calculation.",
                code: `
        import heapq
    
        def dijkstra_with_min_heap(graph, start):
            heap = [(0, start)]
            distances = {node: float('inf') for node in graph}
            distances[start] = 0
            while heap:
                current_distance, current_node = heapq.heappop(heap)
                if current_distance > distances[current_node]:
                    continue
                for neighbor, weight in graph[current_node]:
                    distance = current_distance + weight
                    if distance < distances[neighbor]:
                        distances[neighbor] = distance
                        heapq.heappush(heap, (distance, neighbor))
            return distances
        
        graph = {
            0: [(1, 2), (2, 4)],
            1: [(2, 1), (3, 7)],
            2: [(3, 3)],
            3: []
        }
        print(dijkstra_with_min_heap(graph, 0))
                        `,
              },
              "Priority Queue": {
                content:
                  "Priority Queues in Dijkstra's algorithm manage the nodes to be processed based on their distances. This data structure ensures that the node with the smallest distance is processed first, optimizing the shortest path calculation.",
                code: `
        import heapq
    
        def dijkstra_with_priority_queue(graph, start):
            heap = [(0, start)]
            distances = {node: float('inf') for node in graph}
            distances[start] = 0
            while heap:
                current_distance, current_node = heapq.heappop(heap)
                if current_distance > distances[current_node]:
                    continue
                for neighbor, weight in graph[current_node]:
                    distance = current_distance + weight
                    if distance < distances[neighbor]:
                        distances[neighbor] = distance
                        heapq.heappush(heap, (distance, neighbor))
            return distances
        
        graph = {
            0: [(1, 2), (2, 4)],
            1: [(2, 1), (3, 7)],
            2: [(3, 3)],
            3: []
        }
        print(dijkstra_with_priority_queue(graph, 0))
                        `,
                Queue: {
                  content:
                    "Using a priority queue in Dijkstra's algorithm helps manage the nodes to be processed based on their distances. This approach ensures that the node with the smallest distance is processed first, optimizing the shortest path calculation.",
                  code: `
        import heapq
    
        def dijkstra_with_queue(graph, start):
            heap = [(0, start)]
            distances = {node: float('inf') for node in graph}
            distances[start] = 0
            while heap:
                current_distance, current_node = heapq.heappop(heap)
                if current_distance > distances[current_node]:
                    continue
                for neighbor, weight in graph[current_node]:
                    distance = current_distance + weight
                    if distance < distances[neighbor]:
                        distances[neighbor] = distance
                        heapq.heappush(heap, (distance, neighbor))
            return distances
        
        graph = {
            0: [(1, 2), (2, 4)],
            1: [(2, 1), (3, 7)],
            2: [(3, 3)],
            3: []
        }
        print(dijkstra_with_queue(graph, 0))
                          `,
                },
              },
            },
          },
        },
      },
      "Count Paths": {
        content:
          "Counting paths in a graph involves finding all possible ways to reach a destination from a start point. Dynamic programming techniques like memoization and tabulation are commonly used to optimize the path counting process.",
        code: `
        def count_paths(graph, start, end, memo={}):
            if start == end:
                return 1
            if start in memo:
                return memo[start]
            total_paths = 0
            for neighbor in graph[start]:
                total_paths += count_paths(graph, neighbor, end, memo)
            memo[start] = total_paths
            return total_paths
        
        graph = {0: [1, 2], 1: [2], 2: [3], 3: []}
        print(count_paths(graph, 0, 3))
                `,
        "Dynamic Programming": {
          content:
            "Dynamic Programming (DP) breaks down complex problems into simpler subproblems, solving them systematically. This technique optimizes the path counting process by storing intermediate results, significantly improving efficiency.",
          code: `
        def count_paths_dp(graph, start, end):
            memo = {}
            def dfs(node):
                if node == end:
                    return 1
                if node in memo:
                    return memo[node]
                total_paths = 0
                for neighbor in graph[node]:
                    total_paths += dfs(neighbor)
                memo[node] = total_paths
                return total_paths
            return dfs(start)
        
        graph = {0: [1, 2], 1: [2], 2: [3], 3: []}
        print(count_paths_dp(graph, 0, 3))
                  `,
          Memoization: {
            content:
              "Memoization stores the results of expensive function calls and reuses them when the same inputs occur again. This technique reduces the number of computations required, significantly improving efficiency.",
            code: `
        def count_paths_memo(graph, start, end, memo={}):
            if start == end:
                return 1
            if start in memo:
                return memo[start]
            total_paths = 0
            for neighbor in graph[start]:
                total_paths += count_paths_memo(graph, neighbor, end, memo)
            memo[start] = total_paths
            return total_paths
        
        graph = {0: [1, 2], 1: [2], 2: [3], 3: []}
        print(count_paths_memo(graph, 0, 3))
                    `,
            "Depth First Search": {
              content:
                "DFS with memoization helps in counting paths by storing intermediate results. This combination leverages the depth-first exploration and the efficiency of memoization to solve complex path counting problems.",
              code: `
        def count_paths_dfs_memo(graph, start, end, memo={}):
            if start == end:
                return 1
            if start in memo:
                return memo[start]
            total_paths = 0
            for neighbor in graph[start]:
                total_paths += count_paths_dfs_memo(graph, neighbor, end, memo)
            memo[start] = total_paths
            return total_paths
        
        graph = {0: [1, 2], 1: [2], 2: [3], 3: []}
        print(count_paths_dfs_memo(graph, 0, 3))
                      `,
            },
            "Hash Map": {
              content:
                "Hash Maps in memoization store already computed values, optimizing time complexity. This approach ensures that repeated calculations are avoided, improving the overall efficiency of the path counting process.",
              code: `
        def count_paths_with_hashmap(graph, start, end, memo={}):
            if start == end:
                return 1
            if start in memo:
                return memo[start]
            total_paths = 0
            for neighbor in graph[start]:
                total_paths += count_paths_with_hashmap(graph, neighbor, end, memo)
            memo[start] = total_paths
            return total_paths
        
        graph = {0: [1, 2], 1: [2], 2: [3], 3: []}
        print(count_paths_with_hashmap(graph, 0, 3))
                      `,
            },
            Tabulation: {
              content:
                "Dynamic Programming with tabulation builds solutions iteratively, useful in counting paths. This bottom-up approach constructs the solution from smaller subproblems, ensuring all possible paths are counted efficiently.",
              code: `
        def count_paths_tabulation(graph, start, end):
            dp = [0] * len(graph)
            dp[start] = 1
            for node in range(start, end + 1):
                for neighbor in graph[node]:
                    dp[neighbor] += dp[node]
            return dp[end]
        
        graph = {0: [1, 2], 1: [2], 2: [3], 3: []}
        print(count_paths_tabulation(graph, 0, 3))
                      `,
              "Arrays/Matrix": {
                content:
                  "Dynamic Programming with tabulation uses arrays or matrices to build solutions iteratively. This approach is useful for solving path counting problems by systematically constructing the solution from smaller subproblems.",
                code: `
        def count_paths_with_array(graph, start, end):
            dp = [0] * len(graph)
            dp[start] = 1
            for node in range(start, end + 1):
                for neighbor in graph[node]:
                    dp[neighbor] += dp[node]
            return dp[end]
        
        graph = {0: [1, 2], 1: [2], 2: [3], 3: []}
        print(count_paths_with_array(graph, 0, 3))
                        `,
              },
            },
          },
        },
      },
    },
  };
};

export const MatrixTree = () => {
  return {
    content:
      "Matrices are two-dimensional arrays used to represent data in rows and columns. They are essential for various applications in computer science, including graphics, simulations, and solving linear equations. Understanding matrix operations and traversal techniques is crucial for efficient problem-solving.",
    code: `
        def create_matrix(rows, cols):
            return [[0] * cols for _ in range(rows)]
        
        matrix = create_matrix(3, 3)
        print(matrix)
        `,

    content:
      "Matrices are rectangular arrays of numbers or other mathematical objects, arranged in rows and columns. They are used in various fields such as computer graphics, image processing, and scientific computations. Mastering matrix operations is essential for solving complex mathematical and computational problems.",
    code: `
        def create_matrix(rows, cols):
            return [[0] * cols for _ in range(rows)]
        
        matrix = create_matrix(3, 3)
        print(matrix)
          `,
    "Connected Cells": {
      content:
        "Connected cells in a matrix refer to groups of adjacent cells that share the same value. Finding connected components is crucial for problems like island counting, flood fill, and image segmentation. Various traversal techniques are used to explore and process these components.",
      code: `
        def count_islands(matrix):
            def dfs(i, j):
                if i < 0 or i >= len(matrix) or j < 0 or j >= len(matrix[0]) or matrix[i][j] == 0:
                    return
                matrix[i][j] = 0
                dfs(i + 1, j)
                dfs(i - 1, j)
                dfs(i, j + 1)
                dfs(i, j - 1)
            
            if not matrix:
                return 0
            
            count = 0
            for i in range(len(matrix)):
                for j in range(len(matrix[0])):
                    if matrix[i][j] == 1:
                        dfs(i, j)
                        count += 1
            return count
        
        matrix = [
            [1, 1, 0, 0],
            [1, 0, 0, 1],
            [0, 0, 1, 0],
            [0, 1, 1, 1]
        ]
        print(count_islands(matrix))
              `,
      Graph: {
        content:
          "Graph representations of matrices involve treating each cell as a node and connections between adjacent cells as edges. This approach is useful for exploring and processing connected components, solving shortest path problems, and other graph-based matrix operations.",
        code: `
        def matrix_to_graph(matrix):
            graph = {}
            rows, cols = len(matrix), len(matrix[0])
            for i in range(rows):
                for j in range(cols):
                    if matrix[i][j] == 1:
                        graph[(i, j)] = []
                        for x, y in [(i - 1, j), (i + 1, j), (i, j - 1), (i, j + 1)]:
                            if 0 <= x < rows and 0 <= y < cols and matrix[x][y] == 1:
                                graph[(i, j)].append((x, y))
            return graph
        
        matrix = [
            [1, 1, 0, 0],
            [1, 0, 0, 1],
            [0, 0, 1, 0],
            [0, 1, 1, 1]
        ]
        graph = matrix_to_graph(matrix)
        print(graph)
              `,
        "Explore Components": {
          content:
            "Exploring connected components in matrices involves traversing the matrix to identify and process all groups of connected cells. Techniques like BFS and DFS are used to ensure all cells in a component are visited.",
          code: `
        def explore_components(matrix):
            def bfs(start):
                queue = [start]
                visited.add(start)
                while queue:
                    x, y = queue.pop(0)
                    for nx, ny in [(x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)]:
                        if 0 <= nx < len(matrix) and 0 <= ny < len(matrix[0]) and (nx, ny) not in visited and matrix[nx][ny] == 1:
                            queue.append((nx, ny))
                            visited.add((nx, ny))
            
            visited = set()
            components = 0
            for i in range(len(matrix)):
                for j in range(len(matrix[0])):
                    if (i, j) not in visited and matrix[i][j] == 1:
                        bfs((i, j))
                        components += 1
            return components
        
        matrix = [
            [1, 1, 0, 0],
            [1, 0, 0, 1],
            [0, 0, 1, 0],
            [0, 1, 1, 1]
        ]
        print(explore_components(matrix))
                `,
          "Breadth First Search": {
            content:
              "BFS explores connected components in matrices level by level, useful in flood fill and island counting problems. It uses a queue to manage the exploration process, ensuring that all cells in the current level are processed before moving to the next level.",
            code: `
        from collections import deque
    
        def bfs_connected_components(matrix):
            def bfs(i, j):
                queue = deque([(i, j)])
                matrix[i][j] = 0
                while queue:
                    x, y = queue.popleft()
                    for nx, ny in [(x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)]:
                        if 0 <= nx < len(matrix) and 0 <= ny < len(matrix[0]) and matrix[nx][ny] == 1:
                            matrix[nx][ny] = 0
                            queue.append((nx, ny))
            
            if not matrix:
                return 0
            
            count = 0
            for i in range(len(matrix)):
                for j in range(len(matrix[0])):
                    if matrix[i][j] == 1:
                        bfs(i, j)
                        count += 1
            return count
        
        matrix = [
            [1, 1, 0, 0],
            [1, 0, 0, 1],
            [0, 0, 1, 0],
            [0, 1, 1, 1]
        ]
        print(bfs_connected_components(matrix))
                    `,
            Queue: {
              content:
                "Queues are used in BFS to explore connected components in matrices level by level. This approach ensures that cells are processed in the order they are discovered, making it efficient for flood fill and island counting problems.",
              code: `
        from collections import deque
    
        def bfs_with_queue(matrix):
            def bfs(i, j):
                queue = deque([(i, j)])
                matrix[i][j] = 0
                while queue:
                    x, y = queue.popleft()
                    for nx, ny in [(x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)]:
                        if 0 <= nx < len(matrix) and 0 <= ny < len(matrix[0]) and matrix[nx][ny] == 1:
                            matrix[nx][ny] = 0
                            queue.append((nx, ny))
            
            if not matrix:
                return 0
            
            count = 0
            for i in range(len(matrix)):
                for j in range(len(matrix[0])):
                    if matrix[i][j] == 1:
                        bfs(i, j)
                        count += 1
            return count
        
        matrix = [
            [1, 1, 0, 0],
            [1, 0, 0, 1],
            [0, 0, 1, 0],
            [0, 1, 1, 1]
        ]
        print(bfs_with_queue(matrix))
                      `,
            },
          },
          "Depth First Search": {
            content:
              "DFS explores connected components in matrices deeply before backtracking, useful in finding all connected cells. It uses a stack to manage the exploration process, ensuring that each path is explored to its end before moving to the next path.",
            code: `
        def dfs_connected_components(matrix):
            def dfs(i, j):
                stack = [(i, j)]
                while stack:
                    x, y = stack.pop()
                    for nx, ny in [(x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)]:
                        if 0 <= nx < len(matrix) and 0 <= ny < len(matrix[0]) and matrix[nx][ny] == 1:
                            matrix[nx][ny] = 0
                            stack.append((nx, ny))
            
            if not matrix:
                return 0
            
            count = 0
            for i in range(len(matrix)):
                for j in range(len(matrix[0])):
                    if matrix[i][j] == 1:
                        dfs(i, j)
                        count += 1
            return count
        
        matrix = [
            [1, 1, 0, 0],
            [1, 0, 0, 1],
            [0, 0, 1, 0],
            [0, 1, 1, 1]
        ]
        print(dfs_connected_components(matrix))
                    `,
            Stack: {
              content:
                "DFS uses a stack to explore connected components in matrices deeply before backtracking. This approach ensures that each path is fully explored, making it useful for finding all connected cells in a component.",
              code: `
        def dfs_with_stack(matrix):
            def dfs(i, j):
                stack = [(i, j)]
                while stack:
                    x, y = stack.pop()
                    for nx, ny in [(x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)]:
                        if 0 <= nx < len(matrix) and 0 <= ny < len(matrix[0]) and matrix[nx][ny] == 1:
                            matrix[nx][ny] = 0
                            stack.append((nx, ny))
            
            if not matrix:
                return 0
            
            count = 0
            for i in range(len(matrix)):
                for j in range(len(matrix[0])):
                    if matrix[i][j] == 1:
                        dfs(i, j)
                        count += 1
            return count
        
        matrix = [
            [1, 1, 0, 0],
            [1, 0, 0, 1],
            [0, 0, 1, 0],
            [0, 1, 1, 1]
        ]
        print(dfs_with_stack(matrix))
                      `,
            },
            "Pre-Order": {
              content:
                "Pre-Order traversal processes cells before their neighbors, useful in exploring all possible paths. This method ensures that the current cell is processed before any of its adjacent cells, providing a natural way to explore paths in the matrix.",
              code: `
        def dfs_preorder(matrix, i, j, visited):
            if (i, j) in visited or matrix[i][j] == 0:
                return
            visited.add((i, j))
            print(matrix[i][j])
            for x, y in [(i - 1, j), (i + 1, j), (i, j - 1), (i, j + 1)]:
                if 0 <= x < len(matrix) and 0 <= y < len(matrix[0]):
                    dfs_preorder(matrix, x, y, visited)
        
        matrix = [
            [1, 1, 0, 0],
            [1, 0, 0, 1],
            [0, 0, 1, 0],
            [0, 1, 1, 1]
        ]
        visited = set()
        dfs_preorder(matrix, 0, 0, visited)
                      `,
            },
            "In-Order": {
              content:
                "In-Order traversal processes cells between their neighbors, useful in specific matrix problems. While not as common in matrices as in trees, it can be applied to structured grid problems where a specific order of processing is required.",
              code: `
        def inorder_traversal(matrix, i, j, visited):
            if (i, j) in visited or matrix[i][j] == 0:
                return
            if i > 0:
                inorder_traversal(matrix, i - 1, j, visited)
            visited.add((i, j))
            print(matrix[i][j])
            if i < len(matrix) - 1:
                inorder_traversal(matrix, i + 1, j, visited)
        
        matrix = [
            [1, 1, 0, 0],
            [1, 0, 0, 1],
            [0, 0, 1, 0],
            [0, 1, 1, 1]
        ]
        visited = set()
        inorder_traversal(matrix, 0, 0, visited)
                      `,
            },
            "Post-Order": {
              content:
                "Post-Order traversal processes cells after their neighbors, useful in processing leaf cells first. This method ensures that all adjacent cells are processed before the current cell, making it ideal for cleanup and deletion tasks in matrix problems.",
              code: `
        def dfs_postorder(matrix, i, j, visited):
            if (i, j) in visited or matrix[i][j] == 0:
                return
            for x, y in [(i - 1, j), (i + 1, j), (i, j - 1), (i, j + 1)]:
                if 0 <= x < len(matrix) and 0 <= y < len(matrix[0]):
                    dfs_postorder(matrix, x, y, visited)
            visited.add((i, j))
            print(matrix[i][j])
        
        matrix = [
            [1, 1, 0, 0],
            [1, 0, 0, 1],
            [0, 0, 1, 0],
            [0, 1, 1, 1]
        ]
        visited = set()
        dfs_postorder(matrix, 0, 0, visited)
                      `,
            },
          },
        },
        "Final Ordering": {
          content:
            "Final ordering in matrices involves arranging cells in a specific sequence based on dependencies. Techniques like topological sorting are used to ensure cells are processed in the correct order, which is essential for scheduling and other order-dependent tasks.",
          code: `
        def topological_sort(matrix):
            def dfs(node, visited, stack):
                visited.add(node)
                for neighbor in matrix.get(node, []):
                    if neighbor not in visited:
                        dfs(neighbor, visited, stack)
                stack.append(node)
            
            visited = set()
            stack = []
            for node in matrix:
                if node not in visited:
                    dfs(node, visited, stack)
            return stack[::-1]
        
        matrix = {0: [1], 1: [2], 2: [3], 3: []}
        print(topological_sort(matrix))
                `,
          "Topological Sort": {
            content:
              "Topological sort arranges cells in a linear order based on dependencies. It is essential for scheduling tasks in matrices, ensuring that each cell is processed only after all its dependencies are complete.",
            code: `
        def topological_sort(matrix):
            def dfs(node, visited, stack):
                visited.add(node)
                for neighbor in matrix.get(node, []):
                    if neighbor not in visited:
                        dfs(neighbor, visited, stack)
                stack.append(node)
            
            visited = set()
            stack = []
            for node in matrix:
                if node not in visited:
                    dfs(node, visited, stack)
            return stack[::-1]
        
        matrix = {0: [1], 1: [2], 2: [3], 3: []}
        print(topological_sort(matrix))
                  `,
            "Breadth First Search": {
              content:
                "BFS-based topological sort processes cells level by level, useful in scheduling tasks in matrices. This method uses a queue to manage nodes with no incoming edges, ensuring cells are processed in the correct order.",
              code: `
        from collections import deque
    
        def bfs_topological_sort(matrix, num_nodes):
            in_degree = {i: 0 for i in range(num_nodes)}
            for node in matrix:
                for neighbor in matrix[node]:
                    in_degree[neighbor] += 1
            
            queue = deque([node for node in in_degree if in_degree[node] == 0])
            top_order = []
            
            while queue:
                node = queue.popleft()
                top_order.append(node)
                for neighbor in matrix[node]:
                    in_degree[neighbor] -= 1
                    if in_degree[neighbor] == 0:
                        queue.append(neighbor)
            
            if len(top_order) == num_nodes:
                return top_order
            else:
                return []  # Cycle detected
        
        matrix = {0: [1, 2], 1: [3], 2: [3], 3: []}
        print(bfs_topological_sort(matrix, 4))
                    `,
              Queue: {
                content:
                  "Queues in BFS-based topological sort ensure cells are processed in the correct order. This approach manages nodes with no incoming edges, scheduling tasks efficiently and correctly.",
                code: `
        from collections import deque
    
        def bfs_topological_sort_with_queue(matrix, num_nodes):
            in_degree = {i: 0 for i in range(num_nodes)}
            for node in matrix:
                for neighbor in matrix[node]:
                    in_degree[neighbor] += 1
            
            queue = deque([node for node in in_degree if in_degree[node] == 0])
            top_order = []
            
            while queue:
                node = queue.popleft()
                top_order.append(node)
                for neighbor in matrix[node]:
                    in_degree[neighbor] -= 1
                    if in_degree[neighbor] == 0:
                        queue.append(neighbor)
            
            if len(top_order) == num_nodes:
                return top_order
            else:
                return []  # Cycle detected
        
        matrix = {0: [1, 2], 1: [3], 2: [3], 3: []}
        print(bfs_topological_sort_with_queue(matrix, 4))
                        `,
              },
            },
            "Depth First Search": {
              content:
                "DFS-based topological sort processes cells deeply, useful in detecting cycles and ordering tasks in matrices. This method uses a stack to manage the processing order, ensuring tasks are scheduled based on dependencies.",
              code: `
        def dfs_topological_sort(matrix):
            visited = set()
            stack = []
            def dfs(node):
                visited.add(node)
                for next in matrix.get(node, []):
                    if next not in visited:
                        dfs(next)
                stack.append(node)
            for node in matrix:
                if node not in visited:
                    dfs(node)
            return stack[::-1]
        
        matrix = {0: [1], 1: [2], 2: [3], 3: []}
        print(dfs_topological_sort(matrix))
                    `,
              Stack: {
                content:
                  "Stacks in DFS-based topological sort ensure cells are processed deeply before backtracking. This approach helps in detecting cycles and scheduling tasks in the correct order.",
                code: `
        def dfs_topological_sort_with_stack(matrix):
            visited = set()
            stack = []
            def dfs(node):
                visited.add(node)
                for next in matrix.get(node, []):
                    if next not in visited:
                        dfs(next)
                stack.append(node)
            for node in matrix:
                if node not in visited:
                    dfs(node)
            return stack[::-1]
        
        matrix = {0: [1], 1: [2], 2: [3], 3: []}
        print(dfs_topological_sort_with_stack(matrix))
                        `,
              },
              "Pre-Order": {
                content:
                  "Pre-Order traversal helps in processing cells before their dependencies. This method ensures that the current cell is processed before any of its dependent cells, providing a natural way to explore paths in the matrix.",
                code: `
        def pre_order_topological_sort(matrix):
            visited = set()
            stack = []
            def dfs(node):
                visited.add(node)
                stack.append(node)
                for next in matrix.get(node, []):
                    if next not in visited:
                        dfs(next)
            for node in matrix:
                if node not in visited:
                    dfs(node)
            return stack
        
        matrix = {0: [1], 1: [2], 2: [3], 3: []}
        print(pre_order_topological_sort(matrix))
                        `,
              },
              "In-Order": {
                content:
                  "In-Order traversal helps in processing cells between their dependencies. Although less common in general matrices, it can be useful in structured grid problems where a specific order of processing is required.",
                code: `
        def inorder_traversal_topological(matrix, node, visited):
            if node in visited:
                return
            for neighbor in matrix.get(node, []):
                if neighbor not in visited:
                    inorder_traversal_topological(matrix, neighbor, visited)
            visited.add(node)
            print(node)
        
        matrix = {0: [1, 2], 1: [3], 2: [3], 3: []}
        visited = set()
        inorder_traversal_topological(matrix, 0, visited)
                        `,
              },
              "Post-Order": {
                content:
                  "Post-Order traversal helps in processing cells after their dependencies. This method ensures that all dependent cells are processed before the current cell, making it ideal for cleanup and scheduling tasks in matrix problems.",
                code: `
        def post_order_topological_sort(matrix):
            visited = set()
            stack = []
            def dfs(node):
                visited.add(node)
                for next in matrix.get(node, []):
                    if next not in visited:
                        dfs(next)
                stack.append(node)
            for node in matrix:
                if node not in visited:
                    dfs(node)
            return stack[::-1]
        
        matrix = {0: [1], 1: [2], 2: [3], 3: []}
        print(post_order_topological_sort(matrix))
                        `,
              },
            },
          },
        },
        "Find Shortest Path": {
          content:
            "Finding the shortest path in a matrix is crucial for many applications, such as navigation and network optimization. Depending on whether the matrix has weighted edges, different algorithms like BFS or Dijkstra's can be used.",
          code: `
        def bfs_shortest_path(matrix, start, end):
            from collections import deque
            queue = deque([(start, [start])])
            while queue:
                (x, y), path = queue.popleft()
                if (x, y) == end:
                    return path
                for nx, ny in [(x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)]:
                    if 0 <= nx < len(matrix) and 0 <= ny < len(matrix[0]) and matrix[nx][ny] == 1:
                        queue.append(((nx, ny), path + [(nx, ny)]))
                        matrix[nx][ny] = -1
            return None
        
        matrix = [
            [1, 1, 0, 0],
            [1, 0, 0, 1],
            [0, 0, 1, 0],
            [0, 1, 1, 1]
        ]
        print(bfs_shortest_path(matrix, (0, 0), (3, 3)))
                `,
          "Weighted Edges?": {
            No: {
              content:
                "For unweighted matrices, BFS is typically used to find the shortest path. This algorithm ensures that the shortest path in terms of the number of steps is found efficiently.",
              code: `
        from collections import deque
    
        def bfs_shortest_path_unweighted(matrix, start, end):
            queue = deque([(start, [start])])
            while queue:
                (x, y), path = queue.popleft()
                if (x, y) == end:
                    return path
                for nx, ny in [(x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)]:
                    if 0 <= nx < len(matrix) and 0 <= ny < len(matrix[0]) and matrix[nx][ny] == 1:
                        queue.append(((nx, ny), path + [(nx, ny)]))
                        matrix[nx][ny] = -1
            return None
        
        matrix = [
            [1, 1, 0, 0],
            [1, 0, 0, 1],
            [0, 0, 1, 0],
            [0, 1, 1, 1]
        ]
        print(bfs_shortest_path_unweighted(matrix, (0, 0), (3, 3)))
                    `,
              "Breadth First Search": {
                content:
                  "BFS finds the shortest path in unweighted matrices by exploring level by level. This method guarantees that the shortest path in terms of the number of steps is found efficiently.",
                code: `
        from collections import deque
    
        def bfs_shortest_path_level(matrix, start, end):
            queue = deque([(start, [start])])
            while queue:
                (x, y), path = queue.popleft()
                if (x, y) == end:
                    return path
                for nx, ny in [(x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)]:
                    if 0 <= nx < len(matrix) and 0 <= ny < len(matrix[0]) and matrix[nx][ny] == 1:
                        queue.append(((nx, ny), path + [(nx, ny)]))
                        matrix[nx][ny] = -1
            return None
        
        matrix = [
            [1, 1, 0, 0],
            [1, 0, 0, 1],
            [0, 0, 1, 0],
            [0, 1, 1, 1]
        ]
        print(bfs_shortest_path_level(matrix, (0, 0), (3, 3)))
                      `,
                Queue: {
                  content:
                    "Using a queue in BFS ensures cells are processed in the correct order. This approach helps in finding the shortest path in unweighted matrices by exploring each level fully before moving to the next.",
                  code: `
        from collections import deque
    
        def bfs_with_queue_shortest_path(matrix, start, end):
            queue = deque([(start, [start])])
            while queue:
                (x, y), path = queue.popleft()
                if (x, y) == end:
                    return path
                for nx, ny in [(x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)]:
                    if 0 <= nx < len(matrix) and 0 <= ny < len(matrix[0]) and matrix[nx][ny] == 1:
                        queue.append(((nx, ny), path + [(nx, ny)]))
                        matrix[nx][ny] = -1
            return None
        
        matrix = [
            [1, 1, 0, 0],
            [1, 0, 0, 1],
            [0, 0, 1, 0],
            [0, 1, 1, 1]
        ]
        print(bfs_with_queue_shortest_path(matrix, (0, 0), (3, 3)))
                        `,
                },
              },
            },
            Yes: {
              content:
                "For weighted matrices, Dijkstra's algorithm is typically used to find the shortest path. This algorithm ensures that the shortest path in terms of the total weight is found efficiently.",
              code: `
        import heapq
    
        def dijkstra(matrix, start, end):
            rows, cols = len(matrix), len(matrix[0])
            heap = [(0, start)]
            distances = {start: 0}
            while heap:
                current_distance, (x, y) = heapq.heappop(heap)
                if (x, y) == end:
                    return current_distance
                for nx, ny in [(x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)]:
                    if 0 <= nx < rows and 0 <= ny < cols and matrix[nx][ny] != 0:
                        distance = current_distance + matrix[nx][ny]
                        if (nx, ny) not in distances or distance < distances[(nx, ny)]:
                            distances[(nx, ny)] = distance
                            heapq.heappush(heap, (distance, (nx, ny)))
            return float('inf')
        
        matrix = [
            [1, 3, 0, 0],
            [1, 0, 0, 4],
            [0, 0, 2, 0],
            [0, 1, 1, 1]
        ]
        print(dijkstra(matrix, (0, 0), (3, 3)))
                    `,
              "Dijkstra's Shortest Path": {
                content:
                  "Dijkstra's algorithm uses a min heap to find the shortest path in weighted matrices efficiently. It ensures that the shortest path in terms of the total weight is found by exploring the closest cells first.",
                code: `
        import heapq
    
        def dijkstra_shortest_path(matrix, start, end):
            rows, cols = len(matrix), len(matrix[0])
            heap = [(0, start)]
            distances = {start: 0}
            while heap:
                current_distance, (x, y) = heapq.heappop(heap)
                if (x, y) == end:
                    return current_distance
                for nx, ny in [(x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)]:
                    if 0 <= nx < rows and 0 <= ny < cols and matrix[nx][ny] != 0:
                        distance = current_distance + matrix[nx][ny]
                        if (nx, ny) not in distances or distance < distances[(nx, ny)]:
                            distances[(nx, ny)] = distance
                            heapq.heappush(heap, (distance, (nx, ny)))
            return float('inf')
        
        matrix = [
            [1, 3, 0, 0],
            [1, 0, 0, 4],
            [0, 0, 2, 0],
            [0, 1, 1, 1]
        ]
        print(dijkstra_shortest_path(matrix, (0, 0), (3, 3)))
                      `,
                "Min Heap": {
                  content:
                    "Min Heaps in Dijkstra's algorithm help manage the cells to be processed based on their current shortest distance. This data structure ensures efficient retrieval and update of cells, optimizing the shortest path calculation.",
                  code: `
        import heapq
    
        def dijkstra_with_min_heap(matrix, start, end):
            rows, cols = len(matrix), len(matrix[0])
            heap = [(0, start)]
            distances = {start: 0}
            while heap:
                current_distance, (x, y) = heapq.heappop(heap)
                if (x, y) == end:
                    return current_distance
                for nx, ny in [(x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)]:
                    if 0 <= nx < rows and 0 <= ny < cols and matrix[nx][ny] != 0:
                        distance = current_distance + matrix[nx][ny]
                        if (nx, ny) not in distances or distance < distances[(nx, ny)]:
                            distances[(nx, ny)] = distance
                            heapq.heappush(heap, (distance, (nx, ny)))
            return float('inf')
        
        matrix = [
            [1, 3, 0, 0],
            [1, 0, 0, 4],
            [0, 0, 2, 0],
            [0, 1, 1, 1]
        ]
        print(dijkstra_with_min_heap(matrix, (0, 0), (3, 3)))
                        `,
                },
                "Priority Queue": {
                  content:
                    "Priority Queues in Dijkstra's algorithm manage the cells to be processed based on their distances. This data structure ensures that the cell with the smallest distance is processed first, optimizing the shortest path calculation.",
                  code: `
        import heapq
    
        def dijkstra_with_priority_queue(matrix, start, end):
            rows, cols = len(matrix), len(matrix[0])
            heap = [(0, start)]
            distances = {start: 0}
            while heap:
                current_distance, (x, y) = heapq.heappop(heap)
                if (x, y) == end:
                    return current_distance
                for nx, ny in [(x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)]:
                    if 0 <= nx < rows and 0 <= ny < cols and matrix[nx][ny] != 0:
                        distance = current_distance + matrix[nx][ny]
                        if (nx, ny) not in distances or distance < distances[(nx, ny)]:
                            distances[(nx, ny)] = distance
                            heapq.heappush(heap, (distance, (nx, ny)))
            return float('inf')
        
        matrix = [
            [1, 3, 0, 0],
            [1, 0, 0, 4],
            [0, 0, 2, 0],
            [0, 1, 1, 1]
        ]
        print(dijkstra_with_priority_queue(matrix, (0, 0), (3, 3)))
                          `,
                  Queue: {
                    content:
                      "Using a priority queue in Dijkstra's algorithm helps manage the cells to be processed based on their distances. This approach ensures that the cell with the smallest distance is processed first, optimizing the shortest path calculation.",
                    code: `
        import heapq
    
        def dijkstra_with_queue(matrix, start, end):
            rows, cols = len(matrix), len(matrix[0])
            heap = [(0, start)]
            distances = {start: 0}
            while heap:
                current_distance, (x, y) = heapq.heappop(heap)
                if (x, y) == end:
                    return current_distance
                for nx, ny in [(x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)]:
                    if 0 <= nx < rows and 0 <= ny < cols and matrix[nx][ny] != 0:
                        distance = current_distance + matrix[nx][ny]
                        if (nx, ny) not in distances or distance < distances[(nx, ny)]:
                            distances[(nx, ny)] = distance
                            heapq.heappush(heap, (distance, (nx, ny)))
            return float('inf')
        
        matrix = [
            [1, 3, 0, 0],
            [1, 0, 0, 4],
            [0, 0, 2, 0],
            [0, 1, 1, 1]
        ]
        print(dijkstra_with_queue(matrix, (0, 0), (3, 3)))
                            `,
                  },
                },
              },
            },
          },
        },
        "Count Paths": {
          content:
            "Counting paths in a matrix involves finding all possible ways to reach a destination from a start point. Dynamic programming techniques like memoization and tabulation are commonly used to optimize the path counting process.",
          code: `
        def count_paths(matrix, start, end):
            def dfs(x, y, memo):
                if (x, y) == end:
                    return 1
                if (x, y) in memo:
                    return memo[(x, y)]
                total_paths = 0
                for nx, ny in [(x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)]:
                    if 0 <= nx < len(matrix) and 0 <= ny < len(matrix[0]) and matrix[nx][ny] == 1:
                        total_paths += dfs(nx, ny, memo)
                memo[(x, y)] = total_paths
                return total_paths
            
            memo = {}
            return dfs(start[0], start[1], memo)
        
        matrix = [
            [1, 1, 0, 0],
            [1, 0, 0, 1],
            [0, 0, 1, 0],
            [0, 1, 1, 1]
        ]
        print(count_paths(matrix, (0, 0), (3, 3)))
                `,
          "Dynamic Programming": {
            content:
              "Dynamic Programming (DP) breaks down complex problems into simpler subproblems, solving them systematically. This technique optimizes the path counting process by storing intermediate results, significantly improving efficiency.",
            code: `
        def count_paths_dp(matrix, start, end):
            memo = {}
            def dfs(x, y):
                if (x, y) == end:
                    return 1
                if (x, y) in memo:
                    return memo[(x, y)]
                total_paths = 0
                for nx, ny in [(x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)]:
                    if 0 <= nx < len(matrix) and 0 <= ny < len(matrix[0]) and matrix[nx][ny] == 1:
                        total_paths += dfs(nx, ny)
                memo[(x, y)] = total_paths
                return total_paths
            return dfs(start[0], start[1])
        
        matrix = [
            [1, 1, 0, 0],
            [1, 0, 0, 1],
            [0, 0, 1, 0],
            [0, 1, 1, 1]
        ]
        print(count_paths_dp(matrix, (0, 0), (3, 3)))
                  `,
            Memoization: {
              content:
                "Memoization stores the results of expensive function calls and reuses them when the same inputs occur again. This technique reduces the number of computations required, significantly improving efficiency.",
              code: `
        def count_paths_memo(matrix, start, end):
            memo = {}
            def dfs(x, y):
                if (x, y) == end:
                    return 1
                if (x, y) in memo:
                    return memo[(x, y)]
                total_paths = 0
                for nx, ny in [(x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)]:
                    if 0 <= nx < len(matrix) and 0 <= ny < len(matrix[0]) and matrix[nx][ny] == 1:
                        total_paths += dfs(nx, ny)
                memo[(x, y)] = total_paths
                return total_paths
            return dfs(start[0], start[1])
        
        matrix = [
            [1, 1, 0, 0],
            [1, 0, 0, 1],
            [0, 0, 1, 0],
            [0, 1, 1, 1]
        ]
        print(count_paths_memo(matrix, (0, 0), (3, 3)))
                      `,
              "Depth First Search": {
                content:
                  "DFS with memoization helps in counting paths in matrices by storing intermediate results. This combination leverages the depth-first exploration and the efficiency of memoization to solve complex path counting problems.",
                code: `
        def count_paths_dfs_memo(matrix, start, end):
            memo = {}
            def dfs(x, y):
                if (x, y) == end:
                    return 1
                if (x, y) in memo:
                    return memo[(x, y)]
                total_paths = 0
                for nx, ny in [(x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)]:
                    if 0 <= nx < len(matrix) and 0 <= ny < len(matrix[0]) and matrix[nx][ny] == 1:
                        total_paths += dfs(nx, ny)
                memo[(x, y)] = total_paths
                return total_paths
            return dfs(start[0], start[1])
        
        matrix = [
            [1, 1, 0, 0],
            [1, 0, 0, 1],
            [0, 0, 1, 0],
            [0, 1, 1, 1]
        ]
        print(count_paths_dfs_memo(matrix, (0, 0), (3, 3)))
                        `,
              },
              "Hash Map": {
                content:
                  "Hash Maps in memoization store already computed values, optimizing time complexity. This approach ensures that repeated calculations are avoided, improving the overall efficiency of the path counting process.",
                code: `
        def count_paths_with_hashmap(matrix, start, end):
            memo = {}
            def dfs(x, y):
                if (x, y) == end:
                    return 1
                if (x, y) in memo:
                    return memo[(x, y)]
                total_paths = 0
                for nx, ny in [(x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)]:
                    if 0 <= nx < len(matrix) and 0 <= ny < len(matrix[0]) and matrix[nx][ny] == 1:
                        total_paths += dfs(nx, ny)
                memo[(x, y)] = total_paths
                return total_paths
            return dfs(start[0], start[1])
        
        matrix = [
            [1, 1, 0, 0],
            [1, 0, 0, 1],
            [0, 0, 1, 0],
            [0, 1, 1, 1]
        ]
        print(count_paths_with_hashmap(matrix, (0, 0), (3, 3)))
                        `,
              },
              Tabulation: {
                content:
                  "Dynamic Programming with tabulation builds solutions iteratively, useful in counting paths in matrices. This bottom-up approach constructs the solution from smaller subproblems, ensuring all possible paths are counted efficiently.",
                code: `
        def count_paths_tabulation(matrix, start, end):
            rows, cols = len(matrix), len(matrix[0])
            dp = [[0] * cols for _ in range(rows)]
            dp[start[0]][start[1]] = 1
            for i in range(start[0], rows):
                for j in range(start[1], cols):
                    if matrix[i][j] == 1:
                        if i > 0:
                            dp[i][j] += dp[i - 1][j]
                        if j > 0:
                            dp[i][j] += dp[i][j - 1]
            return dp[end[0]][end[1]]
        
        matrix = [
            [1, 1, 0, 0],
            [1, 0, 0, 1],
            [0, 0, 1, 0],
            [0, 1, 1, 1]
        ]
        print(count_paths_tabulation(matrix, (0, 0), (3, 3)))
                        `,
                "Arrays/Matrix": {
                  content:
                    "Dynamic Programming with tabulation uses arrays or matrices to build solutions iteratively. This approach is useful for solving path counting problems by systematically constructing the solution from smaller subproblems.",
                  code: `
        def count_paths_with_array(matrix, start, end):
            rows, cols = len(matrix), len(matrix[0])
            dp = [[0] * cols for _ in range(rows)]
            dp[start[0]][start[1]] = 1
            for i in range(start[0], rows):
                for j in range(start[1], cols):
                    if matrix[i][j] == 1:
                        if i > 0:
                            dp[i][j] += dp[i - 1][j]
                        if j > 0:
                            dp[i][j] += dp[i][j - 1]
            return dp[end[0]][end[1]]
        
        matrix = [
            [1, 1, 0, 0],
            [1, 0, 0, 1],
            [0, 0, 1, 0],
            [0, 1, 1, 1]
        ]
        print(count_paths_with_array(matrix, (0, 0), (3, 3)))
                          `,
                },
              },
            },
          },
        },
      },
    },
    "Counting Problem": {
      content:
        "Counting problems in matrices involve calculating the number of ways to reach a target cell, count specific patterns, or solve combinatorial problems. Dynamic programming techniques like memoization and tabulation are commonly used to optimize these calculations.",
      code: `
        def count_paths(matrix, start, end):
            def dfs(x, y, memo):
                if (x, y) == end:
                    return 1
                if (x, y) in memo:
                    return memo[(x, y)]
                total_paths = 0
                for nx, ny in [(x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)]:
                    if 0 <= nx < len(matrix) and 0 <= ny < len(matrix[0]) and matrix[nx][ny] == 1:
                        total_paths += dfs(nx, ny, memo)
                memo[(x, y)] = total_paths
                return total_paths
            
            memo = {}
            return dfs(start[0], start[1], memo)
        
        matrix = [
            [1, 1, 0, 0],
            [1, 0, 0, 1],
            [0, 0, 1, 0],
            [0, 1, 1, 1]
        ]
        print(count_paths(matrix, (0, 0), (3, 3)))
            `,
      "Dynamic Programming": {
        content:
          "Dynamic Programming (DP) breaks down complex counting problems into simpler subproblems, solving them systematically. This technique optimizes the counting process by storing intermediate results, significantly improving efficiency.",
        code: `
        def count_paths_dp(matrix, start, end):
            memo = {}
            def dfs(x, y):
                if (x, y) == end:
                    return 1
                if (x, y) in memo:
                    return memo[(x, y)]
                total_paths = 0
                for nx, ny in [(x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)]:
                    if 0 <= nx < len(matrix) and 0 <= ny < len(matrix[0]) and matrix[nx][ny] == 1:
                        total_paths += dfs(nx, ny)
                memo[(x, y)] = total_paths
                return total_paths
            return dfs(start[0], start[1])
        
        matrix = [
            [1, 1, 0, 0],
            [1, 0, 0, 1],
            [0, 0, 1, 0],
            [0, 1, 1, 1]
        ]
        print(count_paths_dp(matrix, (0, 0), (3, 3)))
              `,
        Memoization: {
          content:
            "Memoization stores the results of expensive function calls and reuses them when the same inputs occur again. This technique reduces the number of computations required, significantly improving efficiency.",
          code: `
        def count_paths_memo(matrix, start, end):
            memo = {}
            def dfs(x, y):
                if (x, y) == end:
                    return 1
                if (x, y) in memo:
                    return memo[(x, y)]
                total_paths = 0
                for nx, ny in [(x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)]:
                    if 0 <= nx < len(matrix) and 0 <= ny < len(matrix[0]) and matrix[nx][ny] == 1:
                        total_paths += dfs(nx, ny)
                memo[(x, y)] = total_paths
                return total_paths
            return dfs(start[0], start[1])
        
        matrix = [
            [1, 1, 0, 0],
            [1, 0, 0, 1],
            [0, 0, 1, 0],
            [0, 1, 1, 1]
        ]
        print(count_paths_memo(matrix, (0, 0), (3, 3)))
                `,
          "Depth First Search": {
            content:
              "DFS with memoization helps in solving counting problems by storing intermediate results. This combination leverages the depth-first exploration and the efficiency of memoization to solve complex counting problems.",
            code: `
        def count_paths_dfs_memo(matrix, start, end):
            memo = {}
            def dfs(x, y):
                if (x, y) == end:
                    return 1
                if (x, y) in memo:
                    return memo[(x, y)]
                total_paths = 0
                for nx, ny in [(x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)]:
                    if 0 <= nx < len(matrix) and 0 <= ny < len(matrix[0]) and matrix[nx][ny] == 1:
                        total_paths += dfs(nx, ny)
                memo[(x, y)] = total_paths
                return total_paths
            return dfs(start[0], start[1])
        
        matrix = [
            [1, 1, 0, 0],
            [1, 0, 0, 1],
            [0, 0, 1, 0],
            [0, 1, 1, 1]
        ]
        print(count_paths_dfs_memo(matrix, (0, 0), (3, 3)))
                  `,
          },
          "Hash Map": {
            content:
              "Hash Maps in memoization store already computed values, optimizing time complexity. This approach ensures that repeated calculations are avoided, improving the overall efficiency of the counting process.",
            code: `
        def count_paths_with_hashmap(matrix, start, end):
            memo = {}
            def dfs(x, y):
                if (x, y) == end:
                    return 1
                if (x, y) in memo:
                    return memo[(x, y)]
                total_paths = 0
                for nx, ny in [(x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)]:
                    if 0 <= nx < len(matrix) and 0 <= ny < len(matrix[0]) and matrix[nx][ny] == 1:
                        total_paths += dfs(nx, ny)
                memo[(x, y)] = total_paths
                return total_paths
            return dfs(start[0], start[1])
        
        matrix = [
            [1, 1, 0, 0],
            [1, 0, 0, 1],
            [0, 0, 1, 0],
            [0, 1, 1, 1]
        ]
        print(count_paths_with_hashmap(matrix, (0, 0), (3, 3)))
                  `,
          },
          Tabulation: {
            content:
              "Dynamic Programming with tabulation builds solutions iteratively, useful in solving counting problems. This bottom-up approach constructs the solution from smaller subproblems, ensuring all possible paths are counted efficiently.",
            code: `
        def count_paths_tabulation(matrix, start, end):
            rows, cols = len(matrix), len(matrix[0])
            dp = [[0] * cols for _ in range(rows)]
            dp[start[0]][start[1]] = 1
            for i in range(start[0], rows):
                for j in range(start[1], cols):
                    if matrix[i][j] == 1:
                        if i > 0:
                            dp[i][j] += dp[i - 1][j]
                        if j > 0:
                            dp[i][j] += dp[i][j - 1]
            return dp[end[0]][end[1]]
        
        matrix = [
            [1, 1, 0, 0],
            [1, 0, 0, 1],
            [0, 0, 1, 0],
            [0, 1, 1, 1]
        ]
        print(count_paths_tabulation(matrix, (0, 0), (3, 3)))
                  `,
            "Arrays/Matrix": {
              content:
                "Dynamic Programming with tabulation uses arrays or matrices to build solutions iteratively. This approach is useful for solving counting problems by systematically constructing the solution from smaller subproblems.",
              code: `
        def count_paths_with_array(matrix, start, end):
            rows, cols = len(matrix), len(matrix[0])
            dp = [[0] * cols for _ in range(rows)]
            dp[start[0]][start[1]] = 1
            for i in range(start[0], rows):
                for j in range(start[1], cols):
                    if matrix[i][j] == 1:
                        if i > 0:
                            dp[i][j] += dp[i - 1][j]
                        if j > 0:
                            dp[i][j] += dp[i][j - 1]
            return dp[end[0]][end[1]]
        
        matrix = [
            [1, 1, 0, 0],
            [1, 0, 0, 1],
            [0, 0, 1, 0],
            [0, 1, 1, 1]
        ]
        print(count_paths_with_array(matrix, (0, 0), (3, 3)))
                      `,
            },
          },
        },
      },
    },
    "Is Sorted?": {
      content:
        "Checking if a matrix is sorted involves verifying the order of elements row-wise or column-wise. Efficient search techniques can be applied to sorted matrices, significantly improving search performance.",
      code: `
        def is_sorted(matrix):
            for row in matrix:
                if row != sorted(row):
                    return False
            for col in zip(*matrix):
                if list(col) != sorted(col):
                    return False
            return True
        
        matrix = [
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9]
        ]
        print(is_sorted(matrix))
            `,
      "Search Problem": {
        content:
          "Search problems in sorted matrices involve finding specific elements or ranges efficiently. Techniques like Two Pointers and Binary Search are commonly used to optimize these searches.",
        code: `
        def search_matrix(matrix, target):
            for row in matrix:
                if target in row:
                    return True
            return False
        
        matrix = [
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9]
        ]
        print(search_matrix(matrix, 5))
              `,
        "Two Pointers": {
          content:
            "Two Pointers help in searching sorted matrices by dividing the search space efficiently. This technique can be applied to rows and columns simultaneously, optimizing the search process.",
          code: `
        def two_pointers_search(matrix, target):
            rows, cols = len(matrix), len(matrix[0])
            r, c = 0, cols - 1
            while r < rows and c >= 0:
                if matrix[r][c] == target:
                    return True
                elif matrix[r][c] > target:
                    c -= 1
                else:
                    r += 1
            return False
        
        matrix = [
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9]
        ]
        print(two_pointers_search(matrix, 5))
                `,
        },
        "Binary Search": {
          content:
            "Binary Search in sorted matrices quickly finds elements or insertion points, providing O(log n) time complexity. This technique can be applied to each row or column independently to optimize search performance.",
          code: `
        def binary_search_matrix(matrix, target):
            for row in matrix:
                left, right = 0, len(row) - 1
                while left <= right:
                    mid = (left + right) // 2
                    if row[mid] == target:
                        return True
                    elif row[mid] < target:
                        left += 1
                    else:
                        right -= 1
            return False
        
        matrix = [
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9]
        ]
        print(binary_search_matrix(matrix, 5))
                `,
        },
      },
    },
    "Perform Traversal": {
      content:
        "Matrix traversal techniques involve visiting all elements of the matrix in a specific order. Common traversal methods include spiral, diagonal, and row-wise traversal, each useful for different types of problems.",
      code: `
        def traverse_spiral(matrix):
            result = []
            while matrix:
                result += matrix.pop(0)
                if matrix and matrix[0]:
                    for row in matrix:
                        result.append(row.pop())
                if matrix:
                    result += matrix.pop()[::-1]
                if matrix and matrix[0]:
                    for row in matrix[::-1]:
                        result.append(row.pop(0))
            return result
        
        matrix = [
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9]
        ]
        print(traverse_spiral(matrix))
            `,
      Spiral: {
        content:
          "Spiral traversal in matrices processes elements in a spiral order, useful in problems requiring specific order traversal. This method is commonly used in algorithms related to graphics and matrix manipulation.",
        code: `
        def spiral_order(matrix):
            result = []
            while matrix:
                result += matrix.pop(0)
                if matrix and matrix[0]:
                    for row in matrix:
                        result.append(row.pop())
                if matrix:
                    result += matrix.pop()[::-1]
                if matrix and matrix[0]:
                    for row in matrix[::-1]:
                        result.append(row.pop(0))
            return result
        
        matrix = [
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9]
        ]
        print(spiral_order(matrix))
              `,
      },
      Diagonal: {
        content:
          "Diagonal traversal in matrices processes elements diagonally, useful in specific matrix problems. This method is often used in algorithms related to dynamic programming and matrix manipulations.",
        code: `
        def diagonal_order(matrix):
            result = []
            for line in range(1, (len(matrix) + len(matrix[0]))):
                start_col = max(0, line - len(matrix))
                count = min(line, (len(matrix[0]) - start_col), len(matrix))
                for j in range(0, count):
                    result.append(matrix[min(len(matrix), line) - j - 1][start_col + j])
            return result
        
        matrix = [
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9]
        ]
        print(diagonal_order(matrix))
              `,
      },
      "Matrix Multiplication": {
        content:
          "Matrix Multiplication helps in solving problems involving multiplication of matrices, providing efficient solutions. This operation is fundamental in many scientific and engineering applications.",
        code: `
        def matrix_multiply(A, B):
            result = [[0] * len(B[0]) for _ in range(len(A))]
            for i in range(len(A)):
                for j in range(len(B[0])):
                    for k in range(len(B)):
                        result[i][j] += A[i][k] * B[k][j]
            return result
        
        A = [
            [1, 2],
            [3, 4]
        ]
        B = [
            [5, 6],
            [7, 8]
        ]
        print(matrix_multiply(A, B))
              `,
      },
      Rotation: {
        content:
          "Matrix Rotation rotates the elements of a matrix, useful in problems requiring reorientation of data. This technique is commonly used in image processing and computational geometry.",
        code: `
        def rotate_matrix(matrix):
            return [list(reversed(col)) for col in zip(*matrix)]
        
        matrix = [
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9]
        ]
        print(rotate_matrix(matrix))
              `,
      },
    },
  };
};
