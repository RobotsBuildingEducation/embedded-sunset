import { buildCourseLoot } from "./courseLoot.js";
export { tutorial_interface } from "./questionGeneration";
export const getObjectsByGroup = (groupNumber, arrayOfObjects) => {
  return arrayOfObjects.filter(obj => obj.group === groupNumber);
};
export const steps = {
  en: [{
    group: "introduction",
    title: "Introduction To Software Development",
    isStudyGuide: true,
    description: "Expose yourself to fundamentals to improve the quality of your learning before making progress.",
    question: {
      questionText: "Read about the fundamentals of software in the study guide before starting.",
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

          `
    }
  }, {
    group: "tutorial",
    title: "Multiple Choice",
    description: "Choose one answer.",
    isMultipleChoice: true,
    question: {
      questionText: "Which value is a JavaScript number?",
      options: ["42", "'42'", "true", "null"],
      answer: "42"
    }
  }, {
    group: "tutorial",
    title: "Multiple Answer",
    description: "Choose every correct answer.",
    isMultipleAnswerChoice: true,
    question: {
      questionText: "Which keywords can declare a JavaScript variable?",
      options: ["let", "const", "style", "return"],
      answer: ["let", "const"]
    }
  }, {
    group: "tutorial",
    title: "Match the Pairs",
    isMatchPairs: true,
    question: {
      questionText: "Match parameter, return value, and function call with the description that defines each concept.",
      pairs: [{
        left: "Parameter",
        right: "A value a function receives"
      }, {
        left: "Return value",
        right: "The result a function sends back"
      }, {
        left: "Function call",
        right: "An instruction that runs a function"
      }],
      choices: ["A value a function receives", "The result a function sends back", "An instruction that runs a function"],
      answer: {
        Parameter: "A value a function receives",
        "Return value": "The result a function sends back",
        "Function call": "An instruction that runs a function"
      }
    }
  }, {
    group: "tutorial",
    title: "Select Order",
    description: "Practice arranging visible program steps in execution order.",
    isSelectOrder: true,
    question: {
      questionText: "Arrange the statements so the program creates a value, updates it, and then displays the result.",
      options: ["let total = 1;", "total += 2;", "console.log(total);"],
      answer: ["let total = 1;", "total += 2;", "console.log(total);"]
    }
  }, {
    group: "tutorial",
    title: "Find the Relevant Line",
    isRelevantLine: true,
    question: {
      questionText: "Which line changes total from 1 to 3?",
      code: "let total = 1;\ntotal += 2;\nconsole.log(total);",
      answer: [2]
    }
  }, {
    group: "tutorial",
    title: "Code Tracing",
    isCodeTracing: true,
    question: {
      questionText: "Trace the code and determine its final output.",
      code: "let count = 1;\ncount += 2;\nconsole.log(count);",
      options: ["1", "2", "3", "undefined"],
      answer: "3"
    }
  }, {
    group: "tutorial",
    title: "Fill in the Code Blanks",
    isFillCodeBlanks: true,
    question: {
      questionText: "Complete the missing parts of the code.",
      template: "{{keyword}} age = 25;",
      blanks: [{
        key: "keyword",
        hint: "A variable keyword"
      }],
      answer: {
        keyword: "const"
      }
    }
  }, {
    group: "tutorial",
    title: "Code Completion",
    description: "Choose a complete code solution.",
    isCodeCompletion: true,
    question: {
      questionText: "Which code declares a list?",
      options: ["const items = ['apple'];", "const items = 'apple';", "const items = { apple: true };"],
      answer: "const items = ['apple'];"
    }
  }, {
    group: "tutorial",
    title: "Parsons Problem",
    isParsonsProblem: true,
    question: {
      questionText: "Reorder the lines to create a working solution.",
      lines: ["function greet() {", "  console.log('Hello');", "}"],
      answer: ["function greet() {", "  console.log('Hello');", "}"]
    }
  }, {
    group: "tutorial",
    title: "Short Answer",
    description: "Enter a concise answer.",
    isSingleLineText: true,
    question: {
      questionText: "Which keyword declares a constant?",
      placeholder: "Type your answer",
      answer: "const"
    }
  }, {
    group: "tutorial",
    title: "Open Response",
    description: "Explain an idea in your own words.",
    isText: true,
    question: {
      questionText: "Why are variables useful?"
    }
  }, {
    group: "tutorial",
    title: "Code Writing",
    description: "Create code from a requirement.",
    isCode: true,
    isTerminal: false,
    question: {
      questionText: "Declare a variable named age with the value 25.",
      starterCode: "// Write your code below\n",
      answer: "let age = 25;",
      tests: ["Declares age with value 25"]
    }
  }, {
    group: "tutorial",
    title: "Terminal Practice",
    description: "Practice a command in context.",
    isCode: true,
    isTerminal: true,
    question: {
      questionText: "Change into the new_folder directory."
    }
  }, {
    group: "tutorial",
    title: "Choose the Best Implementation",
    isBestImplementation: true,
    question: {
      questionText: "You have an array named items and a function named printItem. Which implementation prints every item and continues to work if the array grows or shrinks?",
      options: ["items.forEach(printItem);", "printItem(items[0]);\nprintItem(items[1]);", "items = printItem;"],
      answer: "items.forEach(printItem);"
    }
  }, {
    group: "tutorial",
    title: "Fix the Bug",
    isFixBug: true,
    question: {
      questionText: "Repair the bug while preserving the intended behavior.",
      starterCode: "const score = 1;\nscore += 1;",
      answer: "let score = 1;\nscore += 1;",
      tests: ["score can be updated", "The final score is 2"]
    }
  }, {
    group: "tutorial",
    title: "Refactoring Challenge",
    isRefactoringChallenge: true,
    question: {
      questionText: "Improve the code without changing its behavior.",
      starterCode: "console.log(1);\nconsole.log(2);\nconsole.log(3);",
      tests: ["Still prints 1, 2, and 3", "Uses a loop"]
    }
  }, {
    group: "tutorial",
    title: "Build Your App",
    description: "Build an app with what you learned in this chapter.",
    isConversationReview: true,
    question: {
      questionText: "Choose and name a small app idea. We will help it grow as you progress!",
      range: [1, 16]
    }
  }, {
    group: "1",
    title: "Data Types in Programming",
    description: "Match JavaScript literal values to their corresponding primitive data types.",
    isMatchPairs: true,
    question: {
      questionText: "Match each literal value to its correct primitive data type in JavaScript:",
      pairs: [{
        left: '"Hello World"',
        right: "string"
      }, {
        left: "42",
        right: "number"
      }, {
        left: "true",
        right: "boolean"
      }, {
        left: "undefined",
        right: "undefined"
      }],
      choices: ["string", "number", "boolean", "undefined"],
      answer: {
        42: "number",
        '"Hello World"': "string",
        true: "boolean",
        undefined: "undefined"
      }
    }
  }, {
    group: "1",
    title: "Anatomy of a Function Declaration",
    description: "Select the correct function header and parameter syntax.",
    isCodeCompletion: true,
    question: {
      questionText: "Which code snippet correctly defines the function header to accept a name argument?",
      code: "function greet(name) {\n  return 'Hello, ' + name;\n}",
      options: ["function greet(name)", "function greet()", "def greet(name)", "fun greet(name)"],
      answer: "function greet(name)"
    }
  }, {
    group: "1",
    title: "Function Return Values vs Console Output",
    description: "Understand the critical difference between return values and console.log.",
    isMultipleChoice: true,
    question: {
      questionText: "What is the primary difference between returning a value from a function and calling console.log()?",
      options: ["return sends data back to the caller for code to use, whereas console.log only displays a value for observation.", "console.log sends its displayed value back to the caller, whereas return only shows it in developer tools.", "return ends the entire JavaScript program, whereas console.log continues it.", "Both make the value available to later calculations in exactly the same way."],
      answer: "return sends data back to the caller for code to use, whereas console.log only displays a value for observation."
    }
  }, {
    group: "1",
    title: "Refactoring to Modern Arrow Functions",
    description: "Refactor a classic function declaration into a concise ES6 arrow function.",
    isRefactoringChallenge: true,
    question: {
      questionText: "Refactor the classic add function below into a one-line arrow function:",
      starterCode: "function add(a, b) {\n  return a + b;\n}",
      answer: "const add = (a, b) => a + b;",
      tests: ["Returns 7 when passed (3, 4)", "Uses concise arrow function syntax"]
    }
  }, {
    group: "1",
    title: "Comparison & Logical Operators",
    description: "Match comparison and logical operators to their operational behavior.",
    isMatchPairs: true,
    question: {
      questionText: "Match each operator to its logical comparison role:",
      pairs: [{
        left: "===",
        right: "Strict equality (checks both value and data type)"
      }, {
        left: "!==",
        right: "Strict inequality (checks if value or type differs)"
      }, {
        left: ">=",
        right: "Greater than or equal to comparison"
      }, {
        left: "&&",
        right: "Logical AND (true only if both expressions are true)"
      }],
      choices: ["Strict equality (checks both value and data type)", "Strict inequality (checks if value or type differs)", "Greater than or equal to comparison", "Logical AND (true only if both expressions are true)"],
      answer: {
        "===": "Strict equality (checks both value and data type)",
        "!==": "Strict inequality (checks if value or type differs)",
        ">=": "Greater than or equal to comparison",
        "&&": "Logical AND (true only if both expressions are true)"
      }
    }
  }, {
    group: "1",
    title: "Constructing an If-Else Tree",
    description: "Arrange lines to create a clean cascading grade calculation conditional structure.",
    isParsonsProblem: true,
    question: {
      questionText: "Arrange the lines into a structured if / else if / else conditional chain:",
      lines: ["if (score >= 90) {", '  return "A";', "} else if (score >= 80) {", '  return "B";', "} else {", '  return "C";', "}"],
      answer: ["if (score >= 90) {", '  return "A";', "} else if (score >= 80) {", '  return "B";', "} else {", '  return "C";', "}"]
    }
  }, {
    group: "1",
    title: "Fixing an Off-By-One Comparison Bug",
    description: "Correct the condition so that age 18 is included as an adult.",
    isFixBug: true,
    question: {
      questionText: "Fix the condition below so that users aged 18 or older are permitted:",
      starterCode: "function canEnter(age) {\n  if (age > 18) {\n    return true;\n  }\n  return false;\n}",
      answer: "function canEnter(age) {\n  if (age >= 18) {\n    return true;\n  }\n  return false;\n}",
      tests: ["canEnter(18) returns true", "canEnter(17) returns false"]
    }
  }, {
    group: "1",
    title: "Truthy and Falsy Values",
    description: "Identify all values that evaluate to false when cast to a boolean in JavaScript.",
    isMultipleAnswerChoice: true,
    question: {
      questionText: "Select all values that are inherently 'falsy' in JavaScript:",
      options: ["0", '""', "null", "undefined", "NaN", "false", '"0"', "[]", "{}"],
      answer: ["0", '""', "null", "undefined", "NaN", "false"]
    }
  }, {
    group: "1",
    title: "Guard Clauses and Early Returns",
    description: "Complete the guard clause comparison to halt invalid execution.",
    isFillCodeBlanks: true,
    question: {
      questionText: "Complete the guard clause condition to return early if the payment amount is less than or equal to zero:",
      template: "function processPayment(amount) {\n  if (amount {{<=}} {{0}}) {\n    return 'Invalid amount';\n  }\n  return 'Approved';\n}",
      blanks: [{
        key: "<=",
        hint: "Comparison operator that includes equality"
      }, {
        key: "0",
        hint: "The boundary value"
      }],
      answer: {
        "<=": "<=",
        0: "0"
      }
    }
  }, {
    group: "1",
    title: "Terminal Practice: Help Command",
    description: "Discover built-in shell assistance in a Bash terminal environment.",
    isCode: true,
    isTerminal: true,
    question: {
      questionText: "In a Bash terminal environment, enter the help command to discover basic commands."
    }
  }, {
    group: "1",
    title: "For Loop Termination with break",
    description: "Identify the control flow keyword used to exit loops early.",
    isSingleLineText: true,
    question: {
      questionText: "Which keyword is used in JavaScript to immediately terminate and exit a loop before its test condition evaluates to false?",
      answer: "break"
    }
  }, {
    group: "1",
    title: "Sequence of Loop Execution",
    description: "Order the lifecycle stages of a standard for loop during execution.",
    isSelectOrder: true,
    question: {
      questionText: "Arrange the execution steps from for-loop setup through the end of its first successful iteration:",
      options: ["1. Initialize counter variable once", "2. Evaluate loop condition", "3. Execute loop body code block", "4. Increment counter expression"],
      answer: ["1. Initialize counter variable once", "2. Evaluate loop condition", "3. Execute loop body code block", "4. Increment counter expression"]
    }
  }, {
    group: "1",
    title: "Code Writing: Array Sum Accumulator",
    description: "Write a function that iterates through an array to compute its total sum.",
    isCode: true,
    question: {
      questionText: "Write a function sumNumbers(numbers) that iterates through an array of numbers and returns their total sum:",
      starterCode: "function sumNumbers(numbers) {\n  // Start with a total, visit each number, and return the result.\n}",
      answer: "function sumNumbers(numbers) {\n  let total = 0;\n  for (let n of numbers) {\n    total += n;\n  }\n  return total;\n}",
      tests: ["sumNumbers returns a number", "sumNumbers([1, 2, 3, 4]) returns 10"]
    }
  }, {
    group: "1",
    title: "Best Implementation: Summing Array Elements",
    description: "Select the cleanest and most idiomatic way to calculate the sum of numbers in JavaScript.",
    isBestImplementation: true,
    question: {
      questionText: "Which implementation provides the cleanest, most declarative approach to sum an array of numbers?",
      options: ["const sum = (arr) => arr.reduce(\n  (total, n) => total + n, 0\n);", "function sum(arr) {\n  let total = 0;\n  for (let i = 0; i < arr.length; i++) {\n    total = total + arr[i];\n  }\n  return total;\n}", "const sum = (arr) => {\n  let total = 0;\n  arr.forEach((n) => {\n    total += n;\n  });\n  return total;\n};", "function sum(arr) {\n  return eval(arr.join('+'));\n}"],
      answer: "const sum = (arr) => arr.reduce(\n  (total, n) => total + n, 0\n);"
    }
  }, {
    group: "1",
    title: "Code Tracing: Loop Counter Iteration",
    description: "Trace variable state through loop iterations.",
    isCodeTracing: true,
    question: {
      questionText: "What will be printed to the console after executing this loop?",
      code: "let count = 1;\nfor (let i = 0; i < 3; i++) {\n  count *= 2;\n}\nconsole.log(count);",
      options: ["8", "6", "4", "16"],
      answer: "8"
    }
  }, {
    group: "1",
    title: "Fixing an Infinite Loop Condition",
    description: "Fix the loop condition that causes an infinite loop.",
    isFixBug: true,
    question: {
      questionText: "Fix the loop counter update so it reaches the loop termination condition without freezing:",
      starterCode: "function countToThree() {\n  let i = 0;\n  while (i < 3) {\n    console.log(i);\n  }\n}",
      answer: "function countToThree() {\n  let i = 0;\n  while (i < 3) {\n    console.log(i);\n    i++;\n  }\n}",
      tests: ["Increments i by 1 each iteration", "Terminates after 3 iterations"]
    }
  }, {
    group: "1",
    title: "Refactoring String Concatenation to Template Literals",
    description: "Modernize string concatenation with backticks and interpolation.",
    isRefactoringChallenge: true,
    question: {
      questionText: "Refactor the string concatenation below to use an ES6 template literal with backticks:",
      starterCode: 'function createGreeting(name, role) {\n  return "User " + name + " is a " + role + ".";\n}',
      answer: "function createGreeting(name, role) {\n  return `User ${name} is a ${role}.`;\n}",
      tests: ['Returns "User Alex is a Developer."', "Uses template literal backticks"]
    }
  }, {
    group: "1",
    title: "Locating Array Mutation Bug",
    description: "Find the line where an unexpected mutation occurs.",
    isRelevantLine: true,
    question: {
      questionText: "Select the line where the first element of the array is removed:",
      code: "let fruits = ['apple', 'banana', 'cherry'];\nfruits.push('date');\nlet removed = fruits.shift();\nconsole.log(fruits);",
      answer: 3
    }
  }, {
    group: "1",
    title: "Terminal Practice: Creating Directories",
    description: "Practice creating a project folder in a command-line environment.",
    isCode: true,
    isTerminal: true,
    question: {
      questionText: "In a bash terminal environment, create a directory called app using the make directory command"
    }
  }, {
    group: "1",
    title: "Open Response: For Loops vs For...Of",
    description: "Explain the architectural trade-offs between indexed and iterable loops.",
    isText: true,
    question: {
      questionText: "Explain the difference between iterating over an array with an indexed for loop versus a for...of loop. When is an indexed loop required over for...of?"
    }
  }, {
    group: "1",
    title: "Build Your App",
    isConversationReview: true,
    description: "See your app gain its first logic with variables, functions, conditions, loops, and arrays.",
    question: {
      questionText: "Your app can now make decisions and work with collections. Let's add that progress to your idea!",
      range: [19, 38]
    }
  }, {
    group: "2",
    title: "Object Literals and Property Access",
    description: "Match object syntax concepts to their definitions and access methods.",
    isMatchPairs: true,
    question: {
      questionText: "Match each JavaScript object concept to its description:",
      pairs: [{
        left: "Object Key",
        right: "The named identifier for a property in an object"
      }, {
        left: "Object Value",
        right: "The data stored at a specific property key"
      }, {
        left: "user.email",
        right: "Dot notation for direct property access"
      }, {
        left: 'user["role"]',
        right: "Bracket notation for dynamic or string-keyed access"
      }],
      choices: ["The named identifier for a property in an object", "The data stored at a specific property key", "Dot notation for direct property access", "Bracket notation for dynamic or string-keyed access"],
      answer: {
        "Object Key": "The named identifier for a property in an object",
        "Object Value": "The data stored at a specific property key",
        "user.email": "Dot notation for direct property access",
        'user["role"]': "Bracket notation for dynamic or string-keyed access"
      }
    }
  }, {
    group: "2",
    title: "Code Writing: Object Factory Function",
    description: "Write a function that constructs and returns a structured user object.",
    isCode: true,
    question: {
      questionText: "Write a function createUser(name, role) that returns an object containing name, role, and an isActive property set to true:",
      starterCode: "function createUser(name, role) {\n  // Return an object with name, role, and isActive.\n}",
      answer: "function createUser(name, role) {\n  return {\n    name,\n    role,\n    isActive: true\n  };\n}",
      tests: ["createUser returns an object", "createUser('Alice', 'admin').isActive is true"]
    }
  }, {
    group: "2",
    title: "Refactoring to Object Destructuring",
    description: "Refactor verbose dot-notation property reads into clean object destructuring.",
    isRefactoringChallenge: true,
    question: {
      questionText: "Refactor the manual property assignments into a single destructuring assignment:",
      starterCode: "function getInfo(product) {\n  const title = product.title;\n  const price = product.price;\n  return `${title}: $${price}`;\n}",
      answer: "function getInfo(product) {\n  const { title, price } = product;\n  return `${title}: $${price}`;\n}",
      tests: ["Returns 'Laptop: $999'", "Uses object destructuring { title, price }"]
    }
  }, {
    group: "2",
    title: "The Object Spread Operator (Immutability)",
    description: "Clone and update object properties without mutating the original object.",
    isFillCodeBlanks: true,
    question: {
      questionText: "Complete the object spread syntax to create a copy of original with an updated dark theme:",
      template: 'const original = { id: 1, theme: "light" };\nconst updated = { {{...original}}, theme: {{"dark"}} };',
      blanks: [{
        key: "...original",
        label: "Spread original object",
        hint: "...original"
      }, {
        key: '"dark"',
        label: "Updated property value",
        hint: '"dark"'
      }],
      answer: {
        "...original": "...original",
        '"dark"': '"dark"'
      }
    }
  }, {
    group: "2",
    title: "Fixing Class Constructor Property Assignment",
    description: "Correct the constructor property assignment to bind values to this.",
    isFixBug: true,
    question: {
      questionText: "Fix the User class constructor below so that the name and email arguments are saved to the instance:",
      starterCode: "class User {\n  constructor(name, email) {\n    name = name;\n    email = email;\n  }\n}",
      answer: "class User {\n  constructor(name, email) {\n    this.name = name;\n    this.email = email;\n  }\n}",
      tests: ["new User('Sam', 's@dev.io').name equals 'Sam'", "Uses this.name and this.email"]
    }
  }, {
    group: "2",
    title: "Class Instantiation with the new Keyword",
    description: "Understand the lifecycle of creating an object instance from a class blueprint.",
    isMultipleChoice: true,
    question: {
      questionText: "What happens when you execute const student = new User('Maya', 'maya@dev.io')?",
      options: ["A new object is created in memory, its constructor is executed with 'this' bound to the new instance, and the instance is returned.", "The User class definition is deleted and replaced with a plain function.", "The code compiles the class into a static JSON string on disk.", "It invokes the class without setting any internal instance properties."],
      answer: "A new object is created in memory, its constructor is executed with 'this' bound to the new instance, and the instance is returned."
    }
  }, {
    group: "2",
    title: "Class Execution and Method Invocation Lifecycle",
    description: "Arrange the chronological phases of defining and using class instances.",
    isSelectOrder: true,
    question: {
      questionText: "Arrange the phases of defining and using a class instance in chronological execution order:",
      options: ["Define class blueprint with constructor and methods", "Instantiate object using new ClassName(args)", "Constructor initializes instance properties on this", "Invoke instance method (e.g. user.getDetails())"],
      answer: ["Define class blueprint with constructor and methods", "Instantiate object using new ClassName(args)", "Constructor initializes instance properties on this", "Invoke instance method (e.g. user.getDetails())"]
    }
  }, {
    group: "2",
    title: "Locating Context Loss in Class Methods",
    description: "Identify the line where this becomes undefined due to losing method binding.",
    isRelevantLine: true,
    question: {
      questionText: "Select the line where detaching the method from the instance causes 'this' context to be lost:",
      code: "class BankAccount {\n  constructor(balance) {\n    this.balance = balance;\n  }\n  deposit(amount) {\n    this.balance += amount;\n  }\n}\nconst account = new BankAccount(100);\nconst detachedDeposit = account.deposit;\ndetachedDeposit(50);\nconsole.log(account.balance);",
      answer: 10
    }
  }, {
    group: "2",
    title: "Best Implementation: Array of Objects Transformation",
    description: "Choose the cleanest way to extract an array of active usernames.",
    isBestImplementation: true,
    question: {
      questionText: "Which method chain cleanest filters active users and maps their names?",
      options: ["const names = users\n  .filter((u) => u.isActive)\n  .map((u) => u.name);", "const names = [];\nfor (let i = 0; i < users.length; i++) {\n  if (users[i].isActive) {\n    names.push(users[i].name);\n  }\n}", "const names = users\n  .map((u) => (u.isActive ? u.name : null))\n  .filter(Boolean);", "const names = users.reduce((acc, u) => {\n  return u.isActive ? [...acc, u.name]\n    :\n    acc;\n}, []);"],
      answer: "const names = users\n  .filter((u) => u.isActive)\n  .map((u) => u.name);"
    }
  }, {
    group: "2",
    title: "Short Answer: Array Filtering Method",
    description: "Identify the array method used to filter elements by a predicate callback.",
    isSingleLineText: true,
    question: {
      questionText: "Which built-in JavaScript Array method returns a new array containing all elements that satisfy a given predicate function?",
      answer: "filter"
    }
  }, {
    group: "2",
    title: "Object Immutability and Property Rules",
    description: "Select all true characteristics of JavaScript objects.",
    isMultipleAnswerChoice: true,
    question: {
      questionText: "Select all true statements regarding JavaScript objects and references:",
      options: ["Object variables hold a memory reference to the object, not the object data itself", "Mutating a nested property on a cloned object affects both if a shallow copy was made", "const prevents the variable identifier from being reassigned, but object properties can still be modified", "Objects can only store string values, never functions or arrays", "Object keys must be integer numbers starting at index 0"],
      answer: ["Object variables hold a memory reference to the object, not the object data itself", "Mutating a nested property on a cloned object affects both if a shallow copy was made", "const prevents the variable identifier from being reassigned, but object properties can still be modified"]
    }
  }, {
    group: "2",
    title: "Code Tracing: Object Reference Mutation",
    description: "Trace variable references pointing to the same underlying object in memory.",
    isCodeTracing: true,
    question: {
      questionText: "What will be printed for userA.score after running this code?",
      code: "let userA = { score: 10 };\nlet userB = userA;\nuserB.score = 25;\nconsole.log(userA.score);",
      options: ["25", "10", "undefined", "NaN"],
      answer: "25"
    }
  }, {
    group: "2",
    title: "Class Inheritance with extends and super",
    description: "Organize class extension and parent constructor invocation.",
    isParsonsProblem: true,
    question: {
      questionText: "Arrange the lines to create an Employee class that inherits from Person:",
      lines: ["class Employee extends Person {", "  constructor(name, role) {", "    super(name);", "    this.role = role;", "  }", "}"],
      answer: ["class Employee extends Person {", "  constructor(name, role) {", "    super(name);", "    this.role = role;", "  }", "}"]
    }
  }, {
    group: "2",
    title: "Open Response: Immutability in JavaScript",
    description: "Explain why avoiding direct object mutation is critical in modern applications.",
    isText: true,
    question: {
      questionText: "Why is immutability important when modifying objects or arrays in JavaScript applications? Explain what unexpected side effects direct mutation causes."
    }
  }, {
    group: "2",
    title: "Optional Chaining for Safe Property Access",
    description: "Select the operator that safely reads deeply nested properties without crashing.",
    isCodeCompletion: true,
    question: {
      questionText: "Which operator safely accesses deeply nested properties when an intermediate property might be null or undefined?",
      code: "const city = user?.profile?.address?.city;",
      options: ["?.", "??", "||", "&&"],
      answer: "?."
    }
  }, {
    group: "2",
    title: "Code Tracing: Object Methods and State",
    description: "Trace class instantiation and method execution to compute internal instance state.",
    isCodeTracing: true,
    question: {
      questionText: "Predict the final logged count value after calling increment(3):",
      code: "class Counter {\n  constructor(start) {\n    this.count = start;\n  }\n  increment(by = 1) {\n    this.count += by;\n    return this.count;\n  }\n}\n\nconst c = new Counter(5);\nc.increment(3);\nconsole.log(c.count);",
      options: ["8", "5", "3", "undefined"],
      answer: "8"
    }
  }, {
    group: "2",
    title: "Terminal Practice: Echo Command",
    description: "Output string messages in the Bash terminal using echo.",
    isCode: true,
    isTerminal: true,
    question: {
      questionText: "In a Bash terminal environment, enter the echo command to print 'Data ready'"
    }
  }, {
    group: "2",
    title: "Build Your App",
    isConversationReview: true,
    description: "See your app gain a structured data model with objects, classes, and collection methods.",
    question: {
      questionText: "Your app now has structured data. Let's connect objects and collections to your idea!",
      range: [40, 56]
    }
  }, {
    group: "3",
    title: "HTML & CSS Phase: Semantic HTML Elements",
    description: "Match semantic HTML elements to their appropriate layout and content roles.",
    isMatchPairs: true,
    showPreview: true,
    question: {
      questionText: "Match each HTML5 element to its semantic role:",
      previewCode: "function SemanticLayoutPreview() {\n  const [activeTab, setActiveTab] = React.useState('Home');\n  return (\n    <div style={{ fontFamily: 'system-ui, sans-serif', fontSize: 12, border: '1px solid #cbd5e1', borderRadius: 8, overflow: 'hidden' }}>\n      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a', color: 'white', padding: '5px 10px' }}>\n        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>\n          <span style={{ background: '#ec4899', color: 'white', padding: '1px 5px', borderRadius: 4, fontSize: 9.5, fontWeight: 700 }}>&lt;header&gt;</span>\n          <strong style={{ fontSize: 12, color: '#f472b6' }}>My Website</strong>\n        </div>\n        <nav style={{ display: 'flex', gap: 4 }}>\n          {['Home', 'Articles'].map(t => (\n            <button key={t} onClick={() => setActiveTab(t)} style={{ border: 0, borderRadius: 4, padding: '2px 7px', background: activeTab === t ? '#ec4899' : '#334155', color: 'white', fontSize: 10.5, cursor: 'pointer', fontWeight: 600 }}>{t}</button>\n          ))}\n        </nav>\n      </header>\n\n      <main style={{ padding: '6px 8px', background: '#f8fafc' }}>\n        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>\n          <span style={{ background: '#3b82f6', color: 'white', padding: '1px 5px', borderRadius: 4, fontSize: 9.5, fontWeight: 700 }}>&lt;main&gt;</span>\n          <span style={{ fontSize: 10, color: '#64748b' }}>Primary Document Body</span>\n        </div>\n        <section style={{ background: 'white', border: '1.5px dashed #10b981', borderRadius: 6, padding: '6px 8px' }}>\n          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>\n            <span style={{ background: '#10b981', color: 'white', padding: '1px 5px', borderRadius: 4, fontSize: 9, fontWeight: 700 }}>&lt;section&gt;</span>\n            <span style={{ fontSize: 11, color: '#0f172a', fontWeight: 700 }}>{activeTab} Thematic Content</span>\n          </div>\n          <p style={{ margin: 0, fontSize: 10.5, color: '#64748b' }}>A standalone section grouped by topic.</p>\n        </section>\n      </main>\n\n      <footer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a', color: '#94a3b8', padding: '4px 10px', fontSize: 10 }}>\n        <span style={{ background: '#f59e0b', color: '#0f172a', padding: '1px 5px', borderRadius: 4, fontSize: 9, fontWeight: 700 }}>&lt;footer&gt;</span>\n        <span>\xA9 2026 Semantic HTML Standards</span>\n      </footer>\n    </div>\n  );\n}",
      pairs: [{
        left: "<header>",
        right: "Introductory content, site title, or top-level navigation"
      }, {
        left: "<main>",
        right: "The dominant, unique content of the document body"
      }, {
        left: "<section>",
        right: "A standalone thematic grouping of related content"
      }, {
        left: "<footer>",
        right: "Closing information, copyright notices, or author links"
      }],
      choices: ["Introductory content, site title, or top-level navigation", "The dominant, unique content of the document body", "A standalone thematic grouping of related content", "Closing information, copyright notices, or author links"],
      answer: {
        "<header>": "Introductory content, site title, or top-level navigation",
        "<main>": "The dominant, unique content of the document body",
        "<section>": "A standalone thematic grouping of related content",
        "<footer>": "Closing information, copyright notices, or author links"
      }
    }
  }, {
    group: "3",
    title: "HTML Attributes and Inputs",
    description: "Complete an input element with the correct type and placeholder.",
    isFillCodeBlanks: true,
    showPreview: true,
    question: {
      questionText: "Complete the input tag to accept email addresses with a helpful placeholder:",
      previewCode: "function EmailInputPreview() {\n  const [email, setEmail] = React.useState('');\n  const isReady = email.includes('@') && email.includes('.');\n  return (\n    <div style={{ padding: '6px 4px', fontFamily: 'system-ui, sans-serif' }}>\n      <label htmlFor=\"preview-email\" style={{ display: 'block', marginBottom: 4, fontSize: 11.5, fontWeight: 700, color: '#334155' }}>Email address</label>\n      <input id=\"preview-email\" type=\"email\" value={email} onChange={(e) => setEmail(e.target.value)} placeholder=\"name@example.com\" required style={{ width: '100%', boxSizing: 'border-box', padding: '7px 10px', fontSize: 13, borderRadius: 7, border: `1.5px solid ${isReady ? '#10b981' : '#cbd5e1'}`, outline: 'none', background: '#f8fafc' }} />\n      <p style={{ margin: '5px 0 0', color: isReady ? '#047857' : '#64748b', fontSize: 11, fontWeight: 500 }}>{isReady ? '\u2713 Ready to submit' : 'Enter a complete email with @ and domain'}</p>\n    </div>\n  );\n}",
      template: '<input\n  type="{{email}}"\n  placeholder="{{Enter your email}}"\n  required\n/>',
      blanks: [{
        key: "email",
        label: "Input type",
        hint: "email"
      }, {
        key: "Enter your email",
        label: "Placeholder text",
        hint: "Enter your email"
      }],
      answer: {
        email: "email",
        "Enter your email": "Enter your email"
      }
    }
  }, {
    group: "3",
    title: "Best Implementation: Accessible Clickable Elements",
    description: "Select the accessible element for triggering interactive actions.",
    isBestImplementation: true,
    showPreview: true,
    question: {
      questionText: "Which implementation provides native keyboard accessibility and screen reader support for a button?",
      previewCode: "function AccessibleButtonPreview() {\n  const [submitted, setSubmitted] = React.useState(0);\n  return (\n    <div style={{ padding: '8px 4px', fontFamily: 'system-ui, sans-serif', textAlign: 'center' }}>\n      <button\n        type=\"button\"\n        onClick={() => setSubmitted(c => c + 1)}\n        style={{ background: '#ec4899', color: 'white', border: 0, padding: '7px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 13, boxShadow: '0 2px 8px rgba(236,72,153,.25)' }}\n      >\n        Submit\n      </button>\n      <p aria-live=\"polite\" style={{ margin: '6px 0 0', color: '#475569', fontSize: 11.5 }}>\n        {submitted ? `Submitted ${submitted} ${submitted === 1 ? 'time' : 'times'}` : 'Interactive button with keyboard focus and ARIA'}\n      </p>\n    </div>\n  );\n}",
      options: ['<button\n  type="button"\n  onClick={handleClick}\n>\n  Submit\n</button>', "<div onClick={handleClick}>\n  Submit\n</div>", "<span onClick={handleClick}>\n  Submit\n</span>", '<a\n  href="#"\n  onClick={handleClick}\n>\n  Submit\n</a>'],
      answer: '<button\n  type="button"\n  onClick={handleClick}\n>\n  Submit\n</button>'
    }
  }, {
    group: "3",
    title: "Fixing Missing Image Alternative Text",
    description: "Add meaningful alternative text so an HTML image is accessible.",
    isFixBug: true,
    question: {
      questionText: "Fix the HTML image so a screen reader can communicate what it represents:",
      starterCode: '<img src="profile.jpg">',
      answer: '<img src="profile.jpg" alt="User profile">',
      tests: ["Includes a meaningful alt attribute", "Keeps the original image source"]
    }
  }, {
    group: "3",
    title: "Assembling a Semantic HTML Card",
    description: "Fill in the missing semantic HTML tags to complete an interactive product card.",
    isFillCodeBlanks: true,
    showPreview: true,
    question: {
      questionText: "Fill in the missing semantic HTML elements to complete the product card:",
      previewCode: "function ProductCardPreview() {\n  const [purchased, setPurchased] = React.useState(false);\n  return (\n    <article style={{ padding: '8px 12px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 8, fontFamily: 'system-ui, sans-serif', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>\n      <div>\n        <h2 style={{ margin: '0 0 2px', fontSize: 14, color: '#0f172a', fontWeight: 700 }}>Product Title</h2>\n        <p style={{ margin: 0, color: '#64748b', fontSize: 11.5 }}>Product Description</p>\n      </div>\n      <button\n        type=\"button\"\n        onClick={() => setPurchased(!purchased)}\n        style={{ border: 0, borderRadius: 7, padding: '7px 14px', cursor: 'pointer', background: purchased ? '#10b981' : '#ec4899', color: 'white', fontWeight: 700, fontSize: 12, flexShrink: 0 }}\n      >\n        {purchased ? 'Purchased \u2713' : 'Buy Now'}\n      </button>\n    </article>\n  );\n}",
      template: '<article class="card">\n  <{{h2}}>Product Title</{{h2}}>\n  <p>Product Description</p>\n  <{{button}}>Buy Now</{{button}}>\n</article>',
      blanks: [{
        key: "h2",
        hint: "A second-level heading"
      }, {
        key: "button",
        hint: "The native interactive control"
      }],
      answer: {
        h2: "h2",
        button: "button"
      }
    }
  }, {
    showPreview: true,
    group: "3",
    title: "The CSS Box Model Layers",
    description: "Order the concentric layers of the CSS Box Model from innermost to outermost.",
    isSelectOrder: true,
    question: {
      previewCode: "function CSSBoxModelExplorer() {\n  const [activeLayer, setActiveLayer] = React.useState('padding');\n  const layers = {\n    margin: { color: '#fb923c', desc: 'Margin: Outermost transparent space around element' },\n    border: { color: '#fbbf24', desc: 'Border: Visible stroke surrounding padding & content' },\n    padding: { color: '#34d399', desc: 'Padding: Clear space between content and border' },\n    content: { color: '#60a5fa', desc: 'Content: The actual text, image, or child element' }\n  };\n  return (\n    <div style={{ padding: '6px 4px', fontFamily: 'system-ui, sans-serif' }}>\n      <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>\n        {Object.keys(layers).map(k => (\n          <button key={k} onClick={() => setActiveLayer(k)} style={{ flex: 1, border: 0, borderRadius: 5, padding: '3px 6px', fontSize: 10.5, fontWeight: 700, textTransform: 'capitalize', cursor: 'pointer', background: activeLayer === k ? layers[k].color : '#e2e8f0', color: activeLayer === k ? '#0f172a' : '#475569' }}>{k}</button>\n        ))}\n      </div>\n      <div style={{ background: '#f8fafc', border: `2px solid ${layers[activeLayer].color}`, borderRadius: 8, padding: '6px 10px', textAlign: 'center' }}>\n        <span style={{ fontSize: 11, fontWeight: 700, color: '#0f172a' }}>{activeLayer.toUpperCase()} LAYER</span>\n        <p style={{ margin: 0, fontSize: 10.5, color: '#64748b' }}>{layers[activeLayer].desc}</p>\n      </div>\n    </div>\n  );\n}",
      questionText: "Arrange the CSS Box Model layers from the inside out:",
      options: ["1. Content area (text/image dimensions)", "2. Padding (space around content inside border)", "3. Border (line surrounding padding)", "4. Margin (space outside the border between elements)"],
      answer: ["1. Content area (text/image dimensions)", "2. Padding (space around content inside border)", "3. Border (line surrounding padding)", "4. Margin (space outside the border between elements)"]
    }
  }, {
    group: "3",
    title: "Box Sizing and Spacing Properties",
    description: "Match CSS spacing properties to their dimensional impact.",
    isMatchPairs: true,
    question: {
      questionText: "Match each CSS layout property to its effect on the element:",
      pairs: [{
        left: "box-sizing: border-box",
        right: "Includes padding and border inside declared width"
      }, {
        left: "margin: 0 auto",
        right: "Horizontally centers a block element with defined width"
      }, {
        left: "gap: 16px",
        right: "Sets spacing between flex/grid child elements"
      }, {
        left: "overflow: hidden",
        right: "Clips child content that exceeds container boundary"
      }],
      choices: ["Includes padding and border inside declared width", "Horizontally centers a block element with defined width", "Sets spacing between flex/grid child elements", "Clips child content that exceeds container boundary"],
      answer: {
        "box-sizing: border-box": "Includes padding and border inside declared width",
        "margin: 0 auto": "Horizontally centers a block element with defined width",
        "gap: 16px": "Sets spacing between flex/grid child elements",
        "overflow: hidden": "Clips child content that exceeds container boundary"
      }
    }
  }, {
    group: "3",
    title: "Short Answer: CSS Fluid Sizing Function",
    description: "Identify the CSS math function used for responsive fluid typography and sizing.",
    isSingleLineText: true,
    question: {
      questionText: "Which CSS math function accepts a minimum, preferred, and maximum value to enable fluid responsive sizing without media queries?",
      answer: "clamp()"
    }
  }, {
    group: "3",
    title: "CSS Layout Overflow and Sizing Rules",
    description: "Select all valid techniques for preventing unwanted horizontal page scrolling.",
    isMultipleAnswerChoice: true,
    question: {
      questionText: "Which techniques help prevent unexpected horizontal overflow and page scrollbars on mobile viewports?",
      options: ["Use box-sizing: border-box globally across all elements", "Use max-width: 100% on images and media containers", "Avoid fixed wide pixel widths on layout wrappers (use percentages, flex, or rem)", "Set min-width: 2000px on all container elements"],
      answer: ["Use box-sizing: border-box globally across all elements", "Use max-width: 100% on images and media containers", "Avoid fixed wide pixel widths on layout wrappers (use percentages, flex, or rem)"]
    }
  }, {
    group: "3",
    title: "Flexbox Navbar Alignment",
    description: "Arrange CSS flexbox properties to space out a navigation bar with centered items.",
    isParsonsProblem: true,
    showPreview: true,
    question: {
      questionText: "Arrange the CSS flexbox rules to create a space-between horizontal navbar:",
      previewCode: "function FlexNavbarPreview() {\n  const [active, setActive] = React.useState('Docs');\n  return (\n    <nav\n      style={{\n        display: 'flex',\n        justifyContent: 'space-between',\n        alignItems: 'center',\n        padding: '12px 24px',\n        background: '#0f172a',\n        borderRadius: 8,\n        color: 'white',\n        fontFamily: 'system-ui, sans-serif'\n      }}\n    >\n      <strong style={{ color: '#f472b6', fontSize: 14, fontWeight: 700 }}>Sunset</strong>\n      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>\n        {['Docs', 'Projects', 'Profile'].map((item) => (\n          <button\n            key={item}\n            type=\"button\"\n            onClick={() => setActive(item)}\n            style={{\n              border: 0,\n              borderRadius: 6,\n              padding: '6px 12px',\n              cursor: 'pointer',\n              background: active === item ? '#ec4899' : '#1e293b',\n              color: 'white',\n              fontSize: 12,\n              fontWeight: 600,\n              transition: 'background 0.15s ease'\n            }}\n          >\n            {item}\n          </button>\n        ))}\n      </div>\n    </nav>\n  );\n}",
      lines: [".navbar {", "  display: flex;", "  justify-content: space-between;", "  align-items: center;", "  padding: 12px 24px;", "}"],
      answer: [".navbar {", "  display: flex;", "  justify-content: space-between;", "  align-items: center;", "  padding: 12px 24px;", "}"]
    }
  }, {
    group: "3",
    title: "Code Writing: Controlled Search Input",
    description: "Write a React functional component rendering a controlled text input.",
    isCode: true,
    showPreview: true,
    question: {
      questionText: "Write a React component SearchInput({ query, setQuery }) that binds value and onChange to control an HTML input:",
      previewCode: "function ControlledSearchPreview() {\n  const [query, setQuery] = React.useState('');\n  const projects = ['Portfolio', 'Weather App', 'Task Tracker'];\n  const matches = projects.filter(p => p.toLowerCase().includes(query.toLowerCase()));\n  return (\n    <div style={{ padding: '6px 4px', fontFamily: 'system-ui, sans-serif' }}>\n      <input type=\"search\" value={query} onChange={(e) => setQuery(e.target.value)} placeholder=\"Type to filter projects...\" style={{ width: '100%', boxSizing: 'border-box', padding: '6px 10px', fontSize: 12.5, border: '1.5px solid #cbd5e1', borderRadius: 7, outline: 'none' }} />\n      <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 5 }}>\n        {matches.map(p => <span key={p} style={{ padding: '3px 7px', borderRadius: 999, background: '#fce7f3', color: '#9d174d', fontSize: 11, fontWeight: 600 }}>{p}</span>)}\n        {!matches.length && <span style={{ color: '#64748b', fontSize: 11 }}>No matching projects</span>}\n      </div>\n    </div>\n  );\n}",
      starterCode: "function SearchInput({ query, setQuery }) {\n  // Return a controlled text input.\n}",
      answer: 'function SearchInput({ query, setQuery }) {\n  return (\n    <input\n      type="text"\n      value={query}\n      onChange={(e) => setQuery(e.target.value)}\n      placeholder="Search..."\n    />\n  );\n}',
      tests: ["Renders an input element", "Binds value to query and updates via onChange"]
    }
  }, {
    group: "3",
    title: "Live Search Filter Function",
    description: "Complete the array filter to match search queries case-insensitively.",
    isFillCodeBlanks: true,
    question: {
      questionText: "Complete the filter expression to search products by title:",
      template: "const results = products.{{filter}}((p) =>\n  p.title\n    .{{toLowerCase}}()\n    .includes(query.toLowerCase())\n);",
      blanks: [{
        key: "filter",
        label: "Filter method",
        hint: "filter"
      }, {
        key: "toLowerCase",
        label: "String lowercase conversion",
        hint: "toLowerCase"
      }],
      answer: {
        filter: "filter",
        toLowerCase: "toLowerCase"
      }
    }
  }, {
    group: "3",
    title: "Refactoring to Controlled Component",
    description: "Refactor unmanaged DOM input reads to controlled React useState binding.",
    isRefactoringChallenge: true,
    question: {
      questionText: "Refactor the imperative document.getElementById read into a controlled React input with useState:",
      starterCode: "function Form() {\n  const handleSubmit = () => {\n    const text = document.getElementById('name').value;\n    alert(text);\n  };\n  return <input id='name' />;\n}",
      answer: "function Form() {\n  const [name, setName] = useState('');\n  const handleSubmit = () => { alert(name); };\n  return <input value={name} onChange={e => setName(e.target.value)} />;\n}",
      tests: ["Uses useState('') for name", "Binds value and onChange to input"]
    }
  }, {
    group: "3",
    title: "Code Writing: Immutable Field Updater",
    description: "Write a helper function that immutably updates a form field in state.",
    isCode: true,
    question: {
      questionText: "Write a function updateField(formData, fieldName, value) that returns a new object with the specified field updated immutably:",
      starterCode: "function updateField(formData, fieldName, value) {\n  // Return a new object with the requested field updated.\n}",
      answer: "function updateField(formData, fieldName, value) {\n  return {\n    ...formData,\n    [fieldName]: value\n  };\n}",
      tests: ["Returns a new object without mutating original", "Updates the dynamic field key correctly"]
    }
  }, {
    group: "3",
    title: "Resetting Input State After Submission",
    description: "Locate the line that clears the text input back to an empty string.",
    isRelevantLine: true,
    question: {
      questionText: "Select the line that resets the input field state to an empty string after saving:",
      code: "const handleAddTodo = (e) => {\n  e.preventDefault();\n  if (!text.trim()) return;\n  setTodos(prev => [...prev, text]);\n  setText('');\n};",
      answer: 5
    }
  }, {
    group: "3",
    title: "Ternary Conditional Rendering",
    description: "Render alternative components based on a boolean authentication flag.",
    isCodeCompletion: true,
    showPreview: true,
    question: {
      questionText: "Which JSX expression renders Dashboard when isLoggedIn is true and LoginView otherwise?",
      previewCode: "function TernaryPreview() {\n  const [isLoggedIn, setIsLoggedIn] = React.useState(false);\n  return (\n    <div style={{ padding: '8px 4px', textAlign: 'center', fontFamily: 'system-ui, sans-serif', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>\n      <div style={{ textAlign: 'left' }}>\n        <strong style={{ color: isLoggedIn ? '#047857' : '#334155', fontSize: 13 }}>{isLoggedIn ? '\uD83D\uDC4B Dashboard Unlocked' : '\uD83D\uDD12 Log In to Continue'}</strong>\n        <p style={{ margin: 0, color: '#64748b', fontSize: 11 }}>{isLoggedIn ? 'Welcome back, developer!' : 'Ternary evaluates the condition.'}</p>\n      </div>\n      <button onClick={() => setIsLoggedIn(!isLoggedIn)} style={{ border: 0, borderRadius: 7, padding: '6px 12px', background: '#ec4899', color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: 12, flexShrink: 0 }}>{isLoggedIn ? 'Log out' : 'Log in'}</button>\n    </div>\n  );\n}",
      options: ["{\n  isLoggedIn ? (\n    <Dashboard />\n  ) : (\n    <LoginView />\n  )\n}", "{\n  if (isLoggedIn) (\n    <Dashboard />\n  ) else (\n    <LoginView />\n  )\n}", "{\n  isLoggedIn && (\n    <Dashboard />\n  ) || (\n    <LoginView />\n  )\n}", "{\n  isLoggedIn ? (\n    <Dashboard />\n  ,\n    <LoginView />\n  )\n}"],
      answer: "{\n  isLoggedIn ? (\n    <Dashboard />\n  ) : (\n    <LoginView />\n  )\n}"
    }
  }, {
    group: "3",
    title: "JSX Syntax Rules and Constraints",
    description: "Select all mandatory syntax rules when writing JSX in React.",
    isMultipleAnswerChoice: true,
    question: {
      questionText: "Select all valid syntax rules required when writing JSX:",
      options: ["Every tag must be explicitly closed (e.g. <img /> or <br />)", "Components must return a single root element or Fragment (<>...</>)", "Use camelCase attributes like className and htmlFor instead of class and for", "JavaScript expressions inside JSX must be enclosed in curly braces {}", "HTML class names must always be written in all-caps"],
      answer: ["Every tag must be explicitly closed (e.g. <img /> or <br />)", "Components must return a single root element or Fragment (<>...</>)", "Use camelCase attributes like className and htmlFor instead of class and for", "JavaScript expressions inside JSX must be enclosed in curly braces {}"]
    }
  }, {
    group: "3",
    title: "Loading State Hierarchy",
    description: "Arrange lines to handle loading, error, and content branches in order.",
    isParsonsProblem: true,
    question: {
      questionText: "Arrange the conditional return hierarchy for an asynchronous view:",
      lines: ["if (isLoading) return <Spinner />;", "if (error) return <ErrorMessage msg={error} />;", "return <DataList items={data} />;"],
      answer: ["if (isLoading) return <Spinner />;", "if (error) return <ErrorMessage msg={error} />;", "return <DataList items={data} />;"]
    }
  }, {
    group: "3",
    title: "Code Tracing: Empty State Evaluation",
    description: "Predict which element renders when the items list is empty.",
    isCodeTracing: true,
    question: {
      questionText: "Predict what will be rendered when items = []:",
      code: "function List({ items }) {\n  if (items.length === 0) {\n    return <p>No items found.</p>;\n  }\n  return (\n    <ul>\n      {items.map((i) => (\n        <li key={i}>{i}</li>\n      ))}\n    </ul>\n  );\n}",
      options: ["<p>No items found.</p>", "<ul></ul>", "null", "Error: Cannot read empty array"],
      answer: "<p>No items found.</p>"
    }
  }, {
    group: "3",
    title: "Best Implementation: Conditional Tab Switching",
    description: "Select the most declarative tab switching implementation.",
    isBestImplementation: true,
    showPreview: true,
    question: {
      questionText: "Which React tab implementation cleanly renders views based on active tab state?",
      previewCode: "function TabSwitcherPreview() {\n  const [tab, setTab] = React.useState('feed');\n  const tabs = { feed: ['Feed Stream', 'Live portfolio activity & commits'], profile: ['Dev Profile', '3 projects \xB7 12 skills completed'] };\n  return (\n    <div style={{ padding: '6px 4px', fontFamily: 'system-ui, sans-serif' }}>\n      <nav style={{ display: 'flex', gap: 6, marginBottom: 6 }}>\n        {Object.keys(tabs).map(name => (\n          <button key={name} onClick={() => setTab(name)} style={{ flex: 1, border: 0, borderRadius: 6, padding: '5px 8px', cursor: 'pointer', textTransform: 'capitalize', background: tab === name ? '#ec4899' : '#e2e8f0', color: tab === name ? 'white' : '#334155', fontWeight: 700, fontSize: 11.5 }}>{name}</button>\n        ))}\n      </nav>\n      <div style={{ padding: '6px 10px', background: '#f8fafc', borderRadius: 7, border: '1px solid #e2e8f0' }}>\n        <strong style={{ color: '#0f172a', fontSize: 12 }}>{tabs[tab][0]}</strong>\n        <p style={{ margin: 0, color: '#64748b', fontSize: 11 }}>{tabs[tab][1]}</p>\n      </div>\n    </div>\n  );\n}",
      options: ["<div>\n  <nav>\n    <button onClick={() => setTab('feed')}>\n      Feed\n    </button>\n    <button onClick={() => setTab('profile')}>\n      Profile\n    </button>\n  </nav>\n  {\n    tab === 'feed' ? (\n      <FeedView />\n    ) : (\n      <ProfileView />\n    )\n  }\n</div>", "<div>\n  <button onclick=\"tab='feed'\">\n    Feed\n  </button>\n  <script>render()</script>\n</div>", "<div>\n  {setTab('feed')}\n  <FeedView />\n</div>", "<div>\n  <iframe src={tab} />\n</div>"],
      answer: "<div>\n  <nav>\n    <button onClick={() => setTab('feed')}>\n      Feed\n    </button>\n    <button onClick={() => setTab('profile')}>\n      Profile\n    </button>\n  </nav>\n  {\n    tab === 'feed' ? (\n      <FeedView />\n    ) : (\n      <ProfileView />\n    )\n  }\n</div>"
    }
  }, {
    group: "3",
    title: "Functional Components",
    description: "Begin the React phase by connecting JavaScript functions, props, and rendered JSX.",
    isMultipleChoice: true,
    question: {
      questionText: "What is a functional React component in modern web development?",
      options: ["A JavaScript function that accepts props and returns JSX describing what should appear on screen.", "A custom hook that can only return state values and never JSX.", "An event handler that directly replaces the page DOM whenever state changes.", "A JavaScript class used only to store data and never render an interface."],
      answer: "A JavaScript function that accepts props and returns JSX describing what should appear on screen."
    }
  }, {
    group: "3",
    title: "Open Response: Virtual DOM and Reconciliation",
    description: "Explain how React optimizes rendering using the Virtual DOM.",
    isText: true,
    question: {
      questionText: "Explain how React's Virtual DOM and reconciliation algorithm optimize updates to the real browser DOM. Why is this more efficient than direct DOM manipulation?"
    }
  }, {
    group: "3",
    title: "Code Tracing: Component Re-rendering Count",
    description: "Trace component re-execution when state is updated.",
    isCodeTracing: true,
    question: {
      questionText: "In a production build without a StrictMode wrapper, how many total times will 'Render App' log if the button is clicked twice?",
      code: "function App() {\n  const [count, setCount] = React.useState(0);\n  console.log('Render App');\n  return (\n    <button onClick={() => setCount((c) => c + 1)}>\n      Click {count}\n    </button>\n  );\n}",
      options: ["3 times (1 initial mount render + 2 click re-renders)", "2 times (only clicks re-render)", "1 time (components render once)", "0 times (functions don't run console logs)"],
      answer: "3 times (1 initial mount render + 2 click re-renders)"
    }
  }, {
    group: "3",
    title: "Fixing Direct State Mutation in Handler",
    description: "Fix the click handler to update count immutably using the state setter function.",
    isFixBug: true,
    question: {
      questionText: "Fix the increment handler below so it calls setCount instead of mutating count directly:",
      starterCode: "function Counter() {\n  let [count, setCount] = useState(0);\n  const handleIncrement = () => {\n    count = count + 1;\n  };\n  return <button onClick={handleIncrement}>{count}</button>;\n}",
      answer: "function Counter() {\n  const [count, setCount] = useState(0);\n  const handleIncrement = () => {\n    setCount(c => c + 1);\n  };\n  return <button onClick={handleIncrement}>{count}</button>;\n}",
      tests: ["Uses setCount(c => c + 1) or setCount(count + 1)", "Triggers component re-render on click"]
    }
  }, {
    group: "3",
    title: "Event Handling in React (Synthetic Events)",
    description: "Understand how React wraps native browser events in cross-browser SyntheticEvents.",
    isMultipleChoice: true,
    question: {
      questionText: "Why does React wrap native browser DOM events in SyntheticEvents?",
      options: ["To provide consistent event behavior and properties across all web browsers.", "To prevent any keyboard events from firing in the browser.", "To automatically send every click event to a remote database.", "To convert all mouse clicks into right-click events."],
      answer: "To provide consistent event behavior and properties across all web browsers."
    }
  }, {
    group: "3",
    title: "Short Answer: React State Hook",
    description: "Identify the primary hook used for state management in functional components.",
    isSingleLineText: true,
    question: {
      questionText: "What is the name of the standard React hook used to declare and update local state variables in functional components?",
      answer: "useState"
    }
  }, {
    group: "3",
    title: "Open Response: Props vs State in React",
    description: "Explain the difference between props and state in component architecture.",
    isText: true,
    question: {
      questionText: "Explain the fundamental differences between props and state in React. How does data flow between parent and child components?"
    }
  }, {
    group: "3",
    title: "Identifying Missing Keys in List Rendering",
    description: "Locate the list mapping item that lacks a unique key prop.",
    isRelevantLine: true,
    question: {
      questionText: "Select the line where the mapped element is missing a unique key prop:",
      code: "function UserList({ users }) {\n  return (\n    <ul>\n      {users.map(u => (\n        <li>{u.name} - {u.email}</li>\n      ))}\n    </ul>\n  );\n}",
      answer: 5
    }
  }, {
    group: "3",
    title: "Code Tracing: Props Down, Events Up",
    description: "Trace data flowing from a parent state into a child presentation component.",
    isCodeTracing: true,
    question: {
      questionText: "Predict what text will display in the Child badge after clicking increment once:",
      code: "function Parent() {\n  const [val, setVal] = React.useState(10);\n  return (\n    <Child\n      current={val}\n      onAdd={() => setVal((v) => v + 5)}\n    />\n  );\n}\n\nfunction Child({ current, onAdd }) {\n  return (\n    <button onClick={onAdd}>\n      Count: {current}\n    </button>\n  );\n}",
      options: ["Count: 15", "Count: 10", "Count: 5", "Count: undefined"],
      answer: "Count: 15"
    }
  }, {
    group: "3",
    title: "Terminal Practice: Listing Files",
    description: "List directory contents in a Bash terminal.",
    isCode: true,
    isTerminal: true,
    question: {
      questionText: "In a Bash terminal environment, enter the command to list files in the current directory"
    }
  }, {
    group: "3",
    title: "Styling Paradigms in React",
    description: "Match React styling approaches to their syntax and scope.",
    isMatchPairs: true,
    question: {
      questionText: "Match each styling technique to its implementation style:",
      pairs: [{
        left: "Inline Style Object",
        right: 'style={{ backgroundColor: "#3b82f6", padding: 12 }}'
      }, {
        left: "CSS Modules",
        right: 'import styles from "./Button.module.css"; className={styles.btn}'
      }, {
        left: "Tailwind / Utility CSS",
        right: 'className="bg-blue-500 p-3 rounded-lg text-white"'
      }, {
        left: "Vanilla Global CSS",
        right: 'className="custom-button" with global style sheet'
      }],
      choices: ['style={{ backgroundColor: "#3b82f6", padding: 12 }}', 'import styles from "./Button.module.css"; className={styles.btn}', 'className="bg-blue-500 p-3 rounded-lg text-white"', 'className="custom-button" with global style sheet'],
      answer: {
        "Inline Style Object": 'style={{ backgroundColor: "#3b82f6", padding: 12 }}',
        "CSS Modules": 'import styles from "./Button.module.css"; className={styles.btn}',
        "Tailwind / Utility CSS": 'className="bg-blue-500 p-3 rounded-lg text-white"',
        "Vanilla Global CSS": 'className="custom-button" with global style sheet'
      }
    }
  }, {
    showPreview: true,
    group: "3",
    title: "Building Flexbox Card Layout",
    description: "Order the CSS rules to structure a centered column card container.",
    isSelectOrder: true,
    question: {
      previewCode: "function FlexboxCardGridLab() {\n  const [justify, setJustify] = React.useState('space-between');\n  return (\n    <div style={{ padding: '6px 4px', fontFamily: 'system-ui, sans-serif' }}>\n      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>\n        <span style={{ fontSize: 11, fontWeight: 700, color: '#334155' }}>justify-content:</span>\n        <div style={{ display: 'flex', gap: 4 }}>\n          {['space-between', 'center', 'flex-start'].map(j => (\n            <button key={j} onClick={() => setJustify(j)} style={{ border: 0, borderRadius: 5, padding: '3px 6px', fontSize: 10, cursor: 'pointer', background: justify === j ? '#ec4899' : '#e2e8f0', color: justify === j ? 'white' : '#334155', fontWeight: 600 }}>{j}</button>\n          ))}\n        </div>\n      </div>\n      <div style={{ display: 'flex', justifyContent: justify, gap: 6, background: '#0f172a', padding: '8px', borderRadius: 8 }}>\n        <div style={{ background: '#ec4899', color: 'white', padding: '6px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>Card A</div>\n        <div style={{ background: '#38bdf8', color: '#0f172a', padding: '6px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>Card B</div>\n      </div>\n    </div>\n  );\n}",
      questionText: "Arrange the CSS rules to center card content vertically and horizontally in a column:",
      options: ["1. display: flex;", "2. flex-direction: column;", "3. align-items: center;", "4. justify-content: center;"],
      answer: ["1. display: flex;", "2. flex-direction: column;", "3. align-items: center;", "4. justify-content: center;"]
    }
  }, {
    group: "3",
    title: "Refactoring State to Common Ancestor (Lifting State)",
    description: "Lift state from child into parent so multiple sibling components share state.",
    isRefactoringChallenge: true,
    question: {
      questionText: "Refactor the isolated state inside SearchInput up into the parent SearchPage:",
      starterCode: "function SearchPage() {\n  return (\n    <div>\n      <SearchInput />\n      <SearchResults />\n    </div>\n  );\n}\n\nfunction SearchInput() {\n  const [query, setQuery] = useState('');\n  return (\n    <input\n      value={query}\n      onChange={(e) => setQuery(e.target.value)}\n    />\n  );\n}",
      answer: "function SearchPage() {\n  const [query, setQuery] = useState('');\n  return (\n    <div>\n      <SearchInput\n        query={query}\n        setQuery={setQuery}\n      />\n      <SearchResults query={query} />\n    </div>\n  );\n}\n\nfunction SearchInput({ query, setQuery }) {\n  return (\n    <input\n      value={query}\n      onChange={(e) => setQuery(e.target.value)}\n    />\n  );\n}",
      tests: ["Defines const [query, setQuery] in SearchPage", "Passes query to SearchResults"]
    }
  }, {
    group: "3",
    title: "Open Response: Side Effects and Lifecycle",
    description: "Explain what constitutes a side effect and why useEffect is required.",
    isText: true,
    question: {
      questionText: "What is a side effect in React, and why should operations like data fetching, event subscriptions, and DOM timers be placed inside useEffect?"
    }
  }, {
    group: "3",
    title: "React Component Lifecycle Order",
    description: "Order the chronological phases of a component from initial mount to unmount.",
    isSelectOrder: true,
    question: {
      questionText: "Arrange the chronological phases of a React component's lifecycle:",
      options: ["1. Initial component render (Mount)", "2. Execute useEffect setup functions", "3. State or prop update triggers re-render", "4. Component unmounts and executes useEffect cleanup"],
      answer: ["1. Initial component render (Mount)", "2. Execute useEffect setup functions", "3. State or prop update triggers re-render", "4. Component unmounts and executes useEffect cleanup"]
    }
  }, {
    group: "3",
    title: "Asynchronous Data Fetching Sequence in useEffect",
    description: "Order the stages of fetching data and managing loading/error states in an effect.",
    isSelectOrder: true,
    question: {
      questionText: "Arrange the steps to fetch data safely in useEffect:",
      options: ["1. Set loading state to true", "2. Execute await fetch(endpoint)", "3. Parse response JSON and set data state", "4. Catch potential errors and set loading to false"],
      answer: ["1. Set loading state to true", "2. Execute await fetch(endpoint)", "3. Parse response JSON and set data state", "4. Catch potential errors and set loading to false"]
    }
  }, {
    group: "3",
    title: "Best Implementation: Immutable Array Appends",
    description: "Select the clean React state update that appends a new item immutably.",
    isBestImplementation: true,
    question: {
      questionText: "Which state setter implementation correctly appends a new post to the top of the feed?",
      options: ["setPosts((prev) => [\n  newPost,\n  ...prev\n]);", "posts.unshift(newPost);\nsetPosts(posts);", "setPosts(posts + newPost);", "setPosts(newPost);"],
      answer: "setPosts((prev) => [\n  newPost,\n  ...prev\n]);"
    }
  }, {
    group: "3",
    title: "Avoiding Stale State in Queued Updates",
    description: "Choose the reliable state update form when the next value depends on the previous one.",
    isMultipleChoice: true,
    question: {
      questionText: "Why is setCount((current) => current + 1) safer than setCount(count + 1) when several updates may be queued?",
      options: ["React gives each updater the latest queued state, avoiding calculations from a stale render value.", "The updater directly mutates count without rendering.", "React state setters only accept functions, never values.", "The updater prevents the component from rendering again."],
      answer: "React gives each updater the latest queued state, avoiding calculations from a stale render value."
    }
  }, {
    group: "3",
    title: "Refactoring State to Custom Hooks",
    description: "Extract reusable fetch state logic into a useFetch custom hook.",
    isRefactoringChallenge: true,
    question: {
      questionText: "Extract the data fetching logic into a reusable useFetch custom hook:",
      starterCode: "function Profile({ url }) {\n  const [data, setData] = useState(null);\n  useEffect(() => {\n    fetch(url)\n      .then((r) => r.json())\n      .then(setData);\n  }, [url]);\n  return <div>{data?.name}</div>;\n}",
      answer: "function useFetch(url) {\n  const [data, setData] = useState(null);\n  useEffect(() => {\n    fetch(url)\n      .then((r) => r.json())\n      .then(setData);\n  }, [url]);\n  return data;\n}",
      tests: ["Defines function useFetch(url)", "Returns fetched data state"]
    }
  }, {
    group: "3",
    title: "useEffect Dependency Array Configuration",
    description: "Fill in the missing dependency array to prevent infinite re-render loops.",
    isFillCodeBlanks: true,
    question: {
      questionText: "Fill in the empty dependency array to ensure the fetch effect runs only once when the component mounts:",
      template: "useEffect(() => {\n  fetchData();\n}, {{[]}});",
      blanks: [{
        key: "[]",
        hint: "An empty dependency array"
      }],
      answer: {
        "[]": "[]"
      }
    }
  }, {
    group: "3",
    title: "Rules of Key Props in React Lists",
    description: "Select all valid criteria and reasons for using key props in React.",
    isMultipleAnswerChoice: true,
    question: {
      questionText: "Select all true statements about key props in React list rendering:",
      options: ["Keys allow React to identify which items have changed, added, or removed", "Keys should be unique and stable identifiers (e.g. item.id) rather than array indices", "Using Math.random() as a key forces unnecessary remounting of elements on every render", "Keys are automatically passed into child components as regular props accessible via props.key", "Key props are only required if the list has more than 1000 items"],
      answer: ["Keys allow React to identify which items have changed, added, or removed", "Keys should be unique and stable identifiers (e.g. item.id) rather than array indices", "Using Math.random() as a key forces unnecessary remounting of elements on every render"]
    }
  }, {
    group: "3",
    title: "Lifting State with Callback Handlers",
    description: "Arrange lines to pass a callback from parent to child to update parent state.",
    isParsonsProblem: true,
    question: {
      questionText: "Arrange the lines of a parent component managing a child item toggle:",
      lines: ["function TodoApp() {", "  const [todos, setTodos] = useState([]);", "  const toggle = (id) => {", "    setTodos(t => update(t, id));", "  };", "  return <TodoList items={todos} onToggle={toggle} />;", "}"],
      answer: ["function TodoApp() {", "  const [todos, setTodos] = useState([]);", "  const toggle = (id) => {", "    setTodos(t => update(t, id));", "  };", "  return <TodoList items={todos} onToggle={toggle} />;", "}"]
    }
  }, {
    group: "3",
    title: "Preventing Infinite Render Loops in useEffect",
    description: "Locate the missing dependency array that triggers an infinite render cycle.",
    isRelevantLine: true,
    question: {
      questionText: "Select the line where the missing dependency array causes the effect to run on every re-render:",
      code: "function Counter() {\n  const [count, setCount] = useState(0);\n  useEffect(() => {\n    setCount(c => c + 1);\n  });\n  return <div>{count}</div>;\n}",
      answer: 5
    }
  }, {
    group: "3",
    title: "Short Answer: Custom Hook Naming Rule",
    description: "Identify the required naming prefix for React custom hooks.",
    isSingleLineText: true,
    question: {
      questionText: "What two-letter prefix must every custom React hook name start with by convention (e.g. useWindowSize)?",
      answer: "use"
    }
  }, {
    group: "3",
    title: "Code Tracing: Derived State vs Redundant State",
    description: "Trace computed values derived directly during render without extra setState calls.",
    isCodeTracing: true,
    question: {
      questionText: "Predict what will be printed for activeCount during render:",
      code: "const items = [\n  { id: 1, active: true },\n  { id: 2, active: false },\n  { id: 3, active: true }\n];\n\nconst activeCount = items\n  .filter((i) => i.active)\n  .length;\n\nconsole.log(activeCount);",
      options: ["2", "3", "1", "undefined"],
      answer: "2"
    }
  }, {
    showPreview: true,
    group: "3",
    title: "Component Composition with props.children",
    description: "Wrap arbitrary JSX components inside a reusable Modal layout.",
    isCodeCompletion: true,
    question: {
      previewCode: "function ModalCompositionPreview() {\n  const [childType, setChildType] = React.useState('user');\n  const title = childType === 'user' ? 'User Profile' : 'Confirm Order';\n\n  return (\n    <div style={{ padding: '4px 2px', fontFamily: 'system-ui, sans-serif' }}>\n      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>\n        <span style={{ fontSize: 10.5, color: '#475569', fontWeight: 700 }}>Pass JSX to &lt;Modal&gt;&#123;children&#125;&lt;/Modal&gt;:</span>\n        <div style={{ display: 'flex', gap: 4 }}>\n          <button onClick={() => setChildType('user')} style={{ border: 0, borderRadius: 5, padding: '2px 8px', fontSize: 10.5, cursor: 'pointer', background: childType === 'user' ? '#ec4899' : '#e2e8f0', color: childType === 'user' ? 'white' : '#334155', fontWeight: 600 }}>&lt;UserProfile /&gt;</button>\n          <button onClick={() => setChildType('order')} style={{ border: 0, borderRadius: 5, padding: '2px 8px', fontSize: 10.5, cursor: 'pointer', background: childType === 'order' ? '#ec4899' : '#e2e8f0', color: childType === 'order' ? 'white' : '#334155', fontWeight: 600 }}>&lt;OrderSummary /&gt;</button>\n        </div>\n      </div>\n      <div style={{ background: '#ffffff', border: '1.5px solid #cbd5e1', borderRadius: 8, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>\n        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a', color: 'white', padding: '5px 10px' }}>\n          <h2 style={{ margin: 0, fontSize: 12, fontWeight: 700 }}>{title}</h2>\n          <span style={{ fontSize: 11, color: '#94a3b8' }}>\u2715</span>\n        </div>\n        <div style={{ padding: '8px 10px', background: '#f8fafc' }}>\n          <div style={{ fontSize: 9.5, color: '#64748b', marginBottom: 4, fontWeight: 600 }}>&#123;children&#125; body container:</div>\n          {childType === 'user' ? (\n            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'white', border: '1px solid #e2e8f0', padding: '6px 8px', borderRadius: 6 }}>\n              <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#ec4899', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>A</div>\n              <div>\n                <div style={{ fontSize: 11.5, fontWeight: 700, color: '#0f172a' }}>Alex Rivera</div>\n                <div style={{ fontSize: 10, color: '#64748b' }}>alex@sunset.io \u2022 Admin</div>\n              </div>\n            </div>\n          ) : (\n            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '6px 8px', borderRadius: 6 }}>\n              <span style={{ fontSize: 11, color: '#166534', fontWeight: 600 }}>\uD83D\uDCB3 Pro Plan Subscription</span>\n              <span style={{ fontSize: 11.5, fontWeight: 700, color: '#15803d' }}>$19.00 / mo</span>\n            </div>\n          )}\n        </div>\n      </div>\n    </div>\n  );\n}",
      questionText: "Which component wrapper cleanly renders arbitrary child content inside a modal container?",
      options: ['function Modal({ title, children }) {\n  return (\n    <div className="modal-backdrop">\n      <h2>{title}</h2>\n      <div className="modal-body">\n        {children}\n      </div>\n    </div>\n  );\n}', "function Modal({ title }) {\n  return <h2>{title}</h2>;\n}", "function Modal(children) {\n  return (\n    <div>\n      {children()}\n    </div>\n  );\n}", "const Modal = (content) => (\n  <div body={content} />\n);"],
      answer: 'function Modal({ title, children }) {\n  return (\n    <div className="modal-backdrop">\n      <h2>{title}</h2>\n      <div className="modal-body">\n        {children}\n      </div>\n    </div>\n  );\n}'
    }
  }, {
    group: "3",
    title: "Canceling a Request When a Component Unmounts",
    description: "Use AbortController to stop an in-flight request during effect cleanup.",
    isFixBug: true,
    question: {
      questionText: "Fix the effect so its fetch request is aborted if the component unmounts before the response arrives:",
      starterCode: "useEffect(() => {\n  fetch('/api/profile')\n    .then((response) => response.json())\n    .then(setData);\n}, []);",
      answer: "useEffect(() => {\n  const controller = new AbortController();\n  fetch('/api/profile', { signal: controller.signal })\n    .then((response) => response.json())\n    .then(setData)\n    .catch((error) => {\n      if (error.name !== 'AbortError') throw error;\n    });\n  return () => controller.abort();\n}, []);",
      tests: ["Creates an AbortController", "Passes controller.signal to fetch", "Calls controller.abort during cleanup"]
    }
  }, {
    group: "3",
    title: "Code Writing: Filtering and Mapping Pipeline",
    description: "Write a utility that filters active users and maps their names.",
    isCode: true,
    question: {
      questionText: "Write a function getActiveUserNames(users) that filters users where isActive is true and returns an array of their name strings:",
      starterCode: "function getActiveUserNames(users) {\n  // Filter active users, then return their names.\n}",
      answer: "function getActiveUserNames(users) {\n  return users\n    .filter((u) => u.isActive)\n    .map((u) => u.name);\n}",
      tests: ["Filters out inactive users", "Returns an array of string names"]
    }
  }, {
    group: "3",
    title: "Interval Timers and useEffect Cleanup",
    description: "Understand how returning a cleanup function from useEffect clears active timers and prevents memory leaks.",
    showPreview: true,
    isCodeCompletion: true,
    question: {
      questionText: "Which useEffect implementation correctly starts an interval timer and clears it in the cleanup function?",
      previewCode: "function TimerWidget() {\n  const [seconds, setSeconds] = React.useState(0);\n  const [isActive, setIsActive] = React.useState(true);\n\n  React.useEffect(() => {\n    if (!isActive) return;\n    const interval = setInterval(() => {\n      setSeconds(s => s + 1);\n    }, 1000);\n    return () => clearInterval(interval);\n  }, [isActive]);\n\n  return (\n    <div style={{ padding: '8px 12px', textAlign: 'center', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>\n      <div style={{ textAlign: 'left' }}>\n        <span style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>{seconds}s</span>\n        <p style={{ margin: 0, color: '#64748b', fontSize: 11 }}>Cleaned up on unmount</p>\n      </div>\n      <button\n        onClick={() => setIsActive(!isActive)}\n        style={{ padding: '6px 14px', background: isActive ? '#ef4444' : '#10b981', color: 'white', border: 'none', borderRadius: 7, cursor: 'pointer', fontWeight: 700, fontSize: 12, flexShrink: 0 }}\n      >\n        {isActive ? 'Pause' : 'Resume'}\n      </button>\n    </div>\n  );\n}",
      options: ["useEffect(() => {\n  const timer = setInterval(() => {\n    setSeconds(s => s + 1);\n  }, 1000);\n  return () => clearInterval(timer);\n}, []);", "useEffect(() => {\n  setInterval(() => {\n    setSeconds(s => s + 1);\n  }, 1000);\n}, []);", "useEffect(() => {\n  const timer = setInterval(() => {\n    setSeconds(s => s + 1);\n  }, 1000);\n  clearInterval(timer);\n}, []);", "useEffect(() => {\n  return setInterval(() => {\n    setSeconds(s => s + 1);\n  }, 1000);\n}, []);"],
      answer: "useEffect(() => {\n  const timer = setInterval(() => {\n    setSeconds(s => s + 1);\n  }, 1000);\n  return () => clearInterval(timer);\n}, []);"
    }
  }, {
    group: "3",
    title: "Build Your App",
    isConversationReview: true,
    description: "See your app evolve from semantic HTML and responsive CSS into an interactive React interface.",
    question: {
      questionText: "Your app now has a responsive, interactive interface. Let's celebrate what changed!",
      range: [58, 106]
    }
  }, {
    showPreview: true,
    group: "4",
    title: "HTTP Methods and RESTful Actions",
    description: "Match core HTTP verbs to standard CRUD database operations.",
    isMatchPairs: true,
    question: {
      previewCode: "function RestApiMethodsClient() {\n  const [method, setMethod] = React.useState('GET');\n  const responses = {\n    GET: { status: '200 OK', body: '[{ id: 1, name: \"Project Alpha\" }]' },\n    POST: { status: '201 Created', body: '{ success: true, id: 2 }' },\n    DELETE: { status: '204 No Content', body: '(Resource deleted)' }\n  };\n  return (\n    <div style={{ padding: '6px 4px', fontFamily: 'system-ui, sans-serif' }}>\n      <div style={{ display: 'flex', gap: 5, marginBottom: 6 }}>\n        {['GET', 'POST', 'DELETE'].map(m => (\n          <button key={m} onClick={() => setMethod(m)} style={{ flex: 1, border: 0, borderRadius: 5, padding: '4px', fontSize: 11, fontWeight: 700, cursor: 'pointer', background: method === m ? '#0f172a' : '#e2e8f0', color: method === m ? '#38bdf8' : '#334155' }}>{m} /api/projects</button>\n        ))}\n      </div>\n      <div style={{ background: '#0f172a', color: '#f8fafc', padding: '6px 10px', borderRadius: 7, fontFamily: 'monospace', fontSize: 11, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>\n        <span>{responses[method].body}</span>\n        <span style={{ color: '#10b981', fontWeight: 700 }}>{responses[method].status}</span>\n      </div>\n    </div>\n  );\n}",
      questionText: "Match each HTTP request method to its primary API role:",
      pairs: [{
        left: "GET",
        right: "Retrieve data or read resources from the server"
      }, {
        left: "POST",
        right: "Create a new resource with a request payload"
      }, {
        left: "PUT / PATCH",
        right: "Update or modify an existing resource"
      }, {
        left: "DELETE",
        right: "Remove a specified resource from the database"
      }],
      choices: ["Retrieve data or read resources from the server", "Create a new resource with a request payload", "Update or modify an existing resource", "Remove a specified resource from the database"],
      answer: {
        GET: "Retrieve data or read resources from the server",
        POST: "Create a new resource with a request payload",
        "PUT / PATCH": "Update or modify an existing resource",
        DELETE: "Remove a specified resource from the database"
      }
    }
  }, {
    group: "4",
    title: "Short Answer: Not Found HTTP Status",
    description: "Identify the standard HTTP status code for missing resources.",
    isSingleLineText: true,
    question: {
      questionText: "What standard 3-digit HTTP status code indicates that the requested server endpoint or resource could not be found?",
      answer: "404"
    }
  }, {
    group: "4",
    title: "Asynchronous JavaScript and the Event Loop",
    description: "Understand non-blocking I/O and how promises resolve in JavaScript.",
    isMultipleChoice: true,
    question: {
      questionText: "Why does Node.js use non-blocking asynchronous I/O for network and database operations?",
      options: ["It lets JavaScript continue handling work while the runtime waits for I/O and later queues the callback or promise continuation.", "It makes every database operation finish at the same time and in any order.", "It guarantees that network requests cannot fail or time out.", "It moves every JavaScript function into its own operating-system process."],
      answer: "It lets JavaScript continue handling work while the runtime waits for I/O and later queues the callback or promise continuation."
    }
  }, {
    group: "4",
    title: "Async / Await Promise Consumption",
    description: "Arrange lines to asynchronously fetch and parse JSON data from an endpoint.",
    isParsonsProblem: true,
    question: {
      questionText: "Arrange the lines into a complete async data fetching function:",
      lines: ["async function getUser(id) {", "  const res = await fetch(`/users/${id}`);", "  if (!res.ok) throw new Error('Error');", "  const data = await res.json();", "  return data;", "}"],
      answer: ["async function getUser(id) {", "  const res = await fetch(`/users/${id}`);", "  if (!res.ok) throw new Error('Error');", "  const data = await res.json();", "  return data;", "}"]
    }
  }, {
    group: "4",
    title: "Code Writing: Health Check API Route",
    description: "Write an Express GET route returning a status JSON response.",
    isCode: true,
    question: {
      questionText: "Write a function registerHealthRoute(app) that registers a GET route on '/api/health' returning a status 200 JSON object { status: 'healthy' }:",
      starterCode: "function registerHealthRoute(app) {\n  // Register GET /api/health and return the required response.\n}",
      answer: "function registerHealthRoute(app) {\n  app.get('/api/health', (req, res) => {\n    res.status(200).json({\n      status: 'healthy'\n    });\n  });\n}",
      tests: ["Registers GET /api/health", "Responds with 200 status and healthy JSON"]
    }
  }, {
    group: "4",
    title: "Handling Request Bodies and JSON Payloads",
    description: "Extract incoming body data and return a 201 Created response.",
    isFillCodeBlanks: true,
    question: {
      questionText: "Complete the POST handler to parse req.body and respond with status 201:",
      template: 'app.post("/api/users", (req, res) => {\n  const data = req.{{body}};\n  res.status({{201}}).json({\n    success: true,\n    user: data\n  });\n});',
      blanks: [{
        key: "body",
        label: "Request payload property",
        hint: "body"
      }, {
        key: "201",
        label: "Created status code",
        hint: "201"
      }],
      answer: {
        body: "body",
        201: "201"
      }
    }
  }, {
    group: "4",
    title: "Fixing Unhandled Promise Rejection",
    description: "Add missing await to prevent sending unresolved promises in API response.",
    isFixBug: true,
    question: {
      questionText: "Fix the async handler below so it awaits the database query before sending JSON response:",
      starterCode: "app.get('/api/users', async (req, res) => {\n  const users = db.getUsers();\n  res.json(users);\n});",
      answer: "app.get('/api/users', async (req, res) => {\n  const users = await db.getUsers();\n  res.json(users);\n});",
      tests: ["Awaits db.getUsers() before sending response", "Sends resolved user records"]
    }
  }, {
    group: "4",
    title: "Refactoring Nested Callbacks to Async/Await",
    description: "Refactor deeply nested error-first callbacks into clean async/await.",
    isRefactoringChallenge: true,
    question: {
      questionText: "Refactor the callback-based query into a modern async/await function:",
      starterCode: "function getUser(id, callback) {\n  db.find(id, (err, user) => {\n    if (err) return callback(err);\n    callback(null, user);\n  });\n}",
      answer: "async function getUser(id) {\n  const user = await db.find(id);\n  return user;\n}",
      tests: ["Uses async/await syntax", "Returns resolved user object directly"]
    }
  }, {
    group: "4",
    title: "Open Response: SQL vs NoSQL Architecture",
    description: "Compare relational tables and document stores for modern applications.",
    isText: true,
    question: {
      questionText: "Compare relational (SQL) databases with document (NoSQL) databases like Firestore. In what scenarios is a flexible NoSQL schema preferable over a strict SQL schema?"
    }
  }, {
    showPreview: true,
    group: "4",
    title: "Best Implementation: Safe Database Queries",
    description: "Select the parameterized query implementation that prevents SQL injection.",
    isBestImplementation: true,
    question: {
      previewCode: "function LiveQuerySimulator() {\n  const [role, setRole] = React.useState('admin');\n  const users = [\n    { id: 1, name: 'Alice Dev', role: 'admin' },\n    { id: 2, name: 'Bob Cloud', role: 'member' },\n    { id: 3, name: 'Carla UI', role: 'admin' }\n  ];\n  const results = users.filter(u => u.role === role);\n\n  return (\n    <div style={{ padding: '6px 8px', fontFamily: 'system-ui, sans-serif' }}>\n      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>\n        <span style={{ fontSize: 11.5, fontWeight: 700, color: '#334155' }}>Parameterized Role Query:</span>\n        <div style={{ display: 'flex', gap: 4 }}>\n          {['admin', 'member'].map(r => (\n            <button key={r} onClick={() => setRole(r)} style={{ border: 0, borderRadius: 5, padding: '3px 8px', background: role === r ? '#ec4899' : '#e2e8f0', color: role === r ? 'white' : '#334155', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>{r}</button>\n          ))}\n        </div>\n      </div>\n      <div style={{ padding: '5px 8px', background: '#0f172a', color: '#38bdf8', borderRadius: 6, fontFamily: 'monospace', fontSize: 11, display: 'flex', justifyContent: 'space-between' }}>\n        <span>WHERE role = $1 [{role}]</span>\n        <span style={{ color: '#10b981' }}>{results.length} matched</span>\n      </div>\n    </div>\n  );\n}",
      questionText: "Which database query implementation safely uses parameterized inputs to prevent SQL injection attacks?",
      options: ["const result = await db.query(\n  'SELECT * FROM users WHERE email = $1',\n  [email]\n);", "const result = await db.query(\n  `SELECT * FROM users WHERE email = '${email}'`\n);", "const result = await db.query(\n  'SELECT * FROM users WHERE email = ' + email\n);", "const result = await db.query(\n  eval(`SELECT * FROM users WHERE email = ${email}`)\n);"],
      answer: "const result = await db.query(\n  'SELECT * FROM users WHERE email = $1',\n  [email]\n);"
    }
  }, {
    group: "4",
    title: "JSON Web Token (JWT) Authentication Flow",
    description: "Order the standard lifecycle steps of token-based API authentication.",
    isSelectOrder: true,
    question: {
      questionText: "Arrange the chronological steps in a token-based authentication flow:",
      options: ["1. Client sends login credentials to /auth/login", "2. Server validates credentials and signs a JWT", "3. Client stores token in memory or secure storage", "4. Client sends token in Authorization Bearer header for API requests"],
      answer: ["1. Client sends login credentials to /auth/login", "2. Server validates credentials and signs a JWT", "3. Client stores token in memory or secure storage", "4. Client sends token in Authorization Bearer header for API requests"]
    }
  }, {
    showPreview: true,
    group: "4",
    title: "Modeling Database Relationships",
    description: "Identify how parent-child records are linked in a relational model.",
    isCodeCompletion: true,
    question: {
      previewCode: "function DatabaseRelationshipInspector() {\n  const [userId, setUserId] = React.useState(1);\n  const comments = [\n    { id: 101, user_id: 1, text: 'Great article on React!' },\n    { id: 102, user_id: 2, text: 'Loved the database section.' },\n    { id: 103, user_id: 1, text: 'Clean architecture tips.' }\n  ];\n  const userComments = comments.filter(c => c.user_id === userId);\n  return (\n    <div style={{ padding: '6px 4px', fontFamily: 'system-ui, sans-serif' }}>\n      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>\n        <span style={{ fontSize: 11, fontWeight: 700, color: '#334155' }}>Foreign Key Relationship (users.id = comments.user_id):</span>\n        <div style={{ display: 'flex', gap: 4 }}>\n          {[1, 2].map(id => (\n            <button key={id} onClick={() => setUserId(id)} style={{ border: 0, borderRadius: 5, padding: '3px 8px', fontSize: 10.5, cursor: 'pointer', background: userId === id ? '#ec4899' : '#e2e8f0', color: userId === id ? 'white' : '#334155', fontWeight: 600 }}>User #{id}</button>\n          ))}\n        </div>\n      </div>\n      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>\n        {userComments.map(c => (\n          <div key={c.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '4px 8px', borderRadius: 6, fontSize: 11, display: 'flex', justifyContent: 'space-between', color: '#0f172a' }}>\n            <span>\uD83D\uDCAC \"{c.text}\"</span>\n            <span style={{ fontFamily: 'monospace', color: '#ec4899', fontSize: 10 }}>user_id: {c.user_id}</span>\n          </div>\n        ))}\n      </div>\n    </div>\n  );\n}",
      questionText: "Which schema definition correctly links a 'comments' table to an author in the 'users' table?",
      options: ["CREATE TABLE comments (\n  id SERIAL PRIMARY KEY,\n  text TEXT,\n  user_id INT REFERENCES users(id)\n);", "CREATE TABLE comments (\n  id SERIAL PRIMARY KEY,\n  text TEXT,\n  user_name TEXT\n);", "CREATE TABLE comments (\n  users JSON\n);", "CREATE TABLE comments (\n  link TABLE users\n);"],
      answer: "CREATE TABLE comments (\n  id SERIAL PRIMARY KEY,\n  text TEXT,\n  user_id INT REFERENCES users(id)\n);"
    }
  }, {
    group: "4",
    title: "Fixing Broken Status Code in Error Response",
    description: "Correct the HTTP status code sent when a requested resource is not found.",
    isFixBug: true,
    question: {
      questionText: "Fix the status code below so that a missing user returns 404 instead of 200:",
      starterCode: "app.get('/api/users/:id', async (req, res) => {\n  const user = await db.find(req.params.id);\n  if (!user) {\n    return res.status(200).json({\n      error: 'User not found'\n    });\n  }\n  res.json(user);\n});",
      answer: "app.get('/api/users/:id', async (req, res) => {\n  const user = await db.find(req.params.id);\n  if (!user) {\n    return res.status(404).json({\n      error: 'User not found'\n    });\n  }\n  res.json(user);\n});",
      tests: ["Returns status 404 when user is null", "Returns error message payload"]
    }
  }, {
    group: "4",
    title: "Environment Variables in JWT Signing",
    description: "Fill in the environment variable reference for JWT secret signing.",
    isFillCodeBlanks: true,
    question: {
      questionText: "Fill in the process.env reference to load the secret key dynamically without hardcoding:",
      template: "function generateToken(user) {\n  return jwt.sign(\n    user,\n    {{process.env.JWT_SECRET}}\n  );\n}",
      blanks: [{
        key: "process.env.JWT_SECRET",
        hint: "Read JWT_SECRET from the server environment"
      }],
      answer: {
        "process.env.JWT_SECRET": "process.env.JWT_SECRET"
      }
    }
  }, {
    group: "4",
    title: "Best Implementation: Authentication Middleware",
    description: "Select the most robust Express authentication guard middleware.",
    isBestImplementation: true,
    question: {
      questionText: "Which middleware correctly validates Bearer tokens from authorization headers?",
      options: ["const authGuard = (req, res, next) => {\n  const token =\n    req.headers.authorization?.split(' ')[1];\n  if (!token) {\n    return res.status(401).json({\n      error: 'Unauthorized'\n    });\n  }\n  try {\n    req.user = jwt.verify(\n      token,\n      process.env.JWT_SECRET\n    );\n    next();\n  } catch (err) {\n    res.status(403).json({\n      error: 'Invalid token'\n    });\n  }\n};", "const authGuard = (req, res, next) => {\n  next();\n};", "const authGuard = (req, res, next) => {\n  if (req.url) next();\n};", "const authGuard = (req, res, next) => {\n  res.send(req.token);\n};"],
      answer: "const authGuard = (req, res, next) => {\n  const token =\n    req.headers.authorization?.split(' ')[1];\n  if (!token) {\n    return res.status(401).json({\n      error: 'Unauthorized'\n    });\n  }\n  try {\n    req.user = jwt.verify(\n      token,\n      process.env.JWT_SECRET\n    );\n    next();\n  } catch (err) {\n    res.status(403).json({\n      error: 'Invalid token'\n    });\n  }\n};"
    }
  }, {
    group: "4",
    title: "Express Middleware Pipeline",
    description: "Arrange lines to configure Express middleware and protected route handlers.",
    isParsonsProblem: true,
    question: {
      questionText: "Arrange the lines to configure JSON parsing middleware before the API route:",
      lines: ["const app = express();", "app.use(express.json());", 'app.get("/api/health", (req, res) => {', '  res.json({ status: "healthy" });', "});", "app.listen(3000);"],
      answer: ["const app = express();", "app.use(express.json());", 'app.get("/api/health", (req, res) => {', '  res.json({ status: "healthy" });', "});", "app.listen(3000);"]
    }
  }, {
    group: "4",
    title: "API Security and Rate Limiting Best Practices",
    description: "Select all critical security measures for production API servers.",
    isMultipleAnswerChoice: true,
    question: {
      questionText: "Select all essential security best practices for backend API servers:",
      options: ["Sanitize and validate all incoming user input", "Implement rate limiting to prevent brute-force attacks", "Store passwords using salted cryptographic hashes (e.g. bcrypt)", "Use HTTPS / TLS to encrypt all traffic in transit", "Expose database credentials directly in client-side bundles", "Disable CORS checks for all domains with wildcard *"],
      answer: ["Sanitize and validate all incoming user input", "Implement rate limiting to prevent brute-force attacks", "Store passwords using salted cryptographic hashes (e.g. bcrypt)", "Use HTTPS / TLS to encrypt all traffic in transit"]
    }
  }, {
    group: "4",
    title: "Error Handling in Async Route Handlers",
    description: "Identify the line where error handling catches rejected promises.",
    isRelevantLine: true,
    question: {
      questionText: "Select the line where the catch block intercepts database errors to prevent server crashes:",
      code: "app.get('/api/users', async (req, res) => {\n  try {\n    const users = await db.query('SELECT * FROM users');\n    res.json(users);\n  } catch (error) {\n    res.status(500).json({ error: 'Database failed' });\n  }\n});",
      answer: 5
    }
  }, {
    group: "4",
    title: "Code Tracing: Async / Await Execution Order",
    description: "Trace asynchronous microtasks vs synchronous logs in Node.js.",
    isCodeTracing: true,
    question: {
      questionText: "Predict the exact order of console logs printed when running this program:",
      code: "console.log('1');\n\nsetTimeout(() => {\n  console.log('2');\n}, 0);\n\nPromise.resolve().then(() => {\n  console.log('3');\n});\n\nconsole.log('4');",
      options: ["1, 4, 3, 2", "1, 2, 3, 4", "1, 3, 4, 2", "4, 3, 2, 1"],
      answer: "1, 4, 3, 2"
    }
  }, {
    group: "4",
    title: "Terminal Practice: Testing API Endpoints with Curl",
    description: "Execute a command to test a backend endpoint from the terminal.",
    isCode: true,
    isTerminal: true,
    question: {
      questionText: "In a Bash terminal, use curl to perform a GET request to 'https://api.example.com/health'"
    }
  }, {
    group: "4",
    title: "Locating the CORS Origin Configuration",
    description: "Locate the line that grants a specific frontend origin permission through CORS.",
    isRelevantLine: true,
    question: {
      questionText: "Select the line where CORS origin permission is configured:",
      code: "const app = express();\nconst cors = require('cors');\napp.use(cors({ origin: 'https://myapp.com' }));\napp.listen(8080);",
      answer: 3
    }
  }, {
    group: "4",
    title: "Build Your App",
    isConversationReview: true,
    description: "See your app gain backend routes, persistent data, error handling, and authentication.",
    question: {
      questionText: "Your app can now communicate with a backend and protect data. Let's add that progress to your project!",
      range: [108, 128]
    }
  }, {
    group: "5",
    title: "Managed Serverless Platforms and Infrastructure Trade-offs",
    description: "Compare managed backend platforms with infrastructure you provision yourself.",
    isMultipleChoice: true,
    question: {
      questionText: "Which trade-off most accurately distinguishes a managed platform such as Firebase or Supabase from running your own VPS?",
      options: ["The provider handles much of the provisioning, scaling, and patching, while your app accepts more platform-specific constraints and pricing.", "Your team receives full operating-system control but must configure capacity and security patches manually.", "The platform can host static files but cannot provide authentication or database services.", "The platform is guaranteed to cost less than a VPS at every traffic level."],
      answer: "The provider handles much of the provisioning, scaling, and patching, while your app accepts more platform-specific constraints and pricing."
    }
  }, {
    group: "5",
    title: "Code Writing: Environment Variable Loader",
    description: "Write a helper function to safely extract configuration from process.env.",
    isCode: true,
    question: {
      questionText: "Write a function getDatabaseConfig() that extracts DB_HOST and DB_PORT from process.env with default fallbacks ('localhost' and 5432):",
      starterCode: "function getDatabaseConfig() {\n  // Read DB_HOST and DB_PORT and provide both fallbacks.\n}",
      answer: "function getDatabaseConfig() {\n  return {\n    host: process.env.DB_HOST || 'localhost',\n    port: Number(process.env.DB_PORT) || 5432\n  };\n}",
      tests: ["Returns host and port keys", "Applies default fallbacks when env vars are missing"]
    }
  }, {
    group: "5",
    title: "Short Answer: Git Snapshot Recording",
    description: "Identify the Git command used to commit staged files to history.",
    isSingleLineText: true,
    question: {
      questionText: "Which Git command is used to record staged file snapshots to repository history with an inline commit message (e.g. using the -m flag)?",
      answer: "git commit"
    }
  }, {
    group: "5",
    title: "Git Daily Development Lifecycle",
    description: "Arrange lines to create a clean commit and sync it with GitHub.",
    isParsonsProblem: true,
    question: {
      questionText: "Arrange the chronological Git workflow commands to stage, commit, and push:",
      lines: ["git status", "git add .", 'git commit -m "feat: add real-time message stream"', "git push origin main"],
      answer: ["git status", "git add .", 'git commit -m "feat: add real-time message stream"', "git push origin main"]
    }
  }, {
    group: "5",
    title: "Terminal Practice: Cloning a GitHub Repository",
    description: "Clone a remote repository to your local computer in the terminal.",
    isCode: true,
    isTerminal: true,
    question: {
      questionText: "In a Bash terminal environment, enter the command to clone https://github.com/example/web-app.git"
    }
  }, {
    group: "5",
    title: "Fixing Missing Firebase Configuration Properties",
    description: "Correct the Firebase config object so that the projectId property is passed correctly.",
    isFixBug: true,
    question: {
      questionText: "Fix the Firebase initialization config below so that projectId is included:",
      starterCode: "const firebaseConfig = {\n  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,\n  authDomain: 'app.firebaseapp.com'\n};\nconst app = initializeApp(firebaseConfig);",
      answer: "const firebaseConfig = {\n  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,\n  authDomain: 'app.firebaseapp.com',\n  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID\n};\nconst app = initializeApp(firebaseConfig);",
      tests: ["Includes projectId from import.meta.env", "Passes valid Vite client configuration to initializeApp"]
    }
  }, {
    group: "5",
    title: "Refactoring to Modular Firebase v9 SDK",
    description: "Refactor legacy v8 namespaced Firebase calls into tree-shakeable modular functions.",
    isRefactoringChallenge: true,
    question: {
      questionText: "Refactor the legacy firebase.auth().signInWithPopup(provider) call to the modular v9 syntax:",
      starterCode: "function login(provider) {\n  return firebase.auth().signInWithPopup(provider);\n}",
      answer: "function login(provider) {\n  return signInWithPopup(auth, provider);\n}",
      tests: ["Uses signInWithPopup(auth, provider)", "Removes legacy namespaced syntax"]
    }
  }, {
    showPreview: true,
    group: "5",
    title: "Subscribing to Auth State (onAuthStateChanged)",
    description: "Keep client state in sync with login/logout status across page reloads.",
    isFillCodeBlanks: true,
    question: {
      previewCode: "function LiveAuthStateObserver() {\n  const [user, setUser] = React.useState({ email: 'dev@sunset.io', name: 'Alex' });\n\n  return (\n    <div style={{ padding: '6px 8px', fontFamily: 'system-ui, sans-serif' }}>\n      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 7 }}>\n        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>\n          <div style={{ width: 24, height: 24, borderRadius: '50%', background: user ? '#ec4899' : '#94a3b8', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>\n            {user ? user.name[0] : '?'}\n          </div>\n          <div>\n            <strong style={{ fontSize: 12, color: '#0f172a' }}>{user ? user.email : 'Signed Out'}</strong>\n            <p style={{ margin: 0, fontSize: 10.5, color: user ? '#10b981' : '#64748b' }}>{user ? 'onAuthStateChanged: Active' : 'No active session'}</p>\n          </div>\n        </div>\n        <button\n          onClick={() => setUser(user ? null : { email: 'dev@sunset.io', name: 'Alex' })}\n          style={{ background: user ? '#ef4444' : '#10b981', color: 'white', border: 0, borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}\n        >\n          {user ? 'Sign Out' : 'Sign In'}\n        </button>\n      </div>\n    </div>\n  );\n}",
      questionText: "Complete the auth observer subscription:",
      template: "const unsubscribe = {{onAuthStateChanged}}(\n  auth,\n  (currentUser) => {\n    {{setUser}}(currentUser);\n  }\n);",
      blanks: [{
        key: "onAuthStateChanged",
        label: "Auth listener function",
        hint: "onAuthStateChanged"
      }, {
        key: "setUser",
        label: "React state setter",
        hint: "setUser"
      }],
      answer: {
        onAuthStateChanged: "onAuthStateChanged",
        setUser: "setUser"
      }
    }
  }, {
    showPreview: true,
    group: "5",
    title: "Best Implementation: Real-Time Firestore Subscription",
    description: "Select the implementation that properly subscribes to real-time updates and unmounts cleanly.",
    isBestImplementation: true,
    question: {
      previewCode: "function LiveFirestoreGuestbook() {\n  const [messages, setMessages] = React.useState([\n    { id: '1', text: 'Connecting to Firestore...' }\n  ]);\n  const [text, setText] = React.useState('');\n  const [isPosting, setIsPosting] = React.useState(false);\n\n  React.useEffect(() => {\n    try {\n      if (!database || typeof onSnapshot !== 'function') return;\n      const expCol = collection(database, 'experiments');\n      const unsubscribe = onSnapshot(expCol, (snapshot) => {\n        const list = [];\n        snapshot.forEach((d) => {\n          list.push({ id: d.id, ...d.data() });\n        });\n        list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));\n        if (list.length > 0) {\n          setMessages(list.slice(0, 2));\n        }\n      }, (err) => console.log('Firestore snapshot fallback:', err.message));\n      return () => unsubscribe();\n    } catch (err) {\n      console.log('Live preview error:', err);\n    }\n  }, []);\n\n  const handlePost = async (e) => {\n    e.preventDefault();\n    if (!text.trim() || isPosting) return;\n    setIsPosting(true);\n    try {\n      if (database && typeof addDoc === 'function') {\n        await addDoc(collection(database, 'experiments'), {\n          text: text.trim(),\n          timestamp: Date.now()\n        });\n      } else {\n        setMessages(prev => [{ id: String(Date.now()), text: text.trim() }, ...prev.slice(0, 1)]);\n      }\n      setText('');\n    } catch (e) {\n      console.log('Error posting to experiments:', e);\n    } finally {\n      setIsPosting(false);\n    }\n  };\n\n  return (\n    <div style={{ padding: '6px 8px', fontFamily: 'system-ui, sans-serif' }}>\n      <form onSubmit={handlePost} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>\n        <input\n          value={text}\n          onChange={(e) => setText(e.target.value)}\n          placeholder=\"Post live message to Firestore...\"\n          style={{ flex: 1, padding: '5px 8px', fontSize: 12, border: '1.5px solid #cbd5e1', borderRadius: 6, outline: 'none' }}\n        />\n        <button\n          type=\"submit\"\n          disabled={isPosting}\n          style={{ background: '#ec4899', color: 'white', border: 0, borderRadius: 6, padding: '5px 12px', fontSize: 11.5, fontWeight: 700, cursor: 'pointer' }}\n        >\n          {isPosting ? '...' : 'Post'}\n        </button>\n      </form>\n      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>\n        {messages.map((m) => (\n          <div key={m.id} style={{ padding: '3px 8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 5, fontSize: 11, color: '#334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>\n            <span style={{ fontWeight: 500 }}>{m.text || 'Cloud entry'}</span>\n            <span style={{ fontSize: 9.5, color: '#10b981', fontWeight: 700 }}>LIVE \u2713</span>\n          </div>\n        ))}\n      </div>\n    </div>\n  );\n}",
      questionText: "Which React useEffect pattern subscribes to Firestore real-time snapshots and cleans up on unmount?",
      options: ["useEffect(() => {\n  const q = query(\n    collection(db, 'messages'),\n    orderBy('createdAt')\n  );\n\n  const unsubscribe = onSnapshot(\n    q,\n    (snapshot) => {\n      setMessages(\n        snapshot.docs.map((d) => ({\n          id: d.id,\n          ...d.data()\n        }))\n      );\n    }\n  );\n\n  return () => unsubscribe();\n}, []);", "useEffect(() => {\n  onSnapshot(\n    collection(db, 'messages'),\n    (s) => setMessages(s.docs)\n  );\n}, []);", "useEffect(() => {\n  const data = getDocs(\n    collection(db, 'messages')\n  );\n  setMessages(data);\n});", "useEffect(() => {\n  setInterval(\n    () => onSnapshot(db, setMessages),\n    1000\n  );\n}, []);"],
      answer: "useEffect(() => {\n  const q = query(\n    collection(db, 'messages'),\n    orderBy('createdAt')\n  );\n\n  const unsubscribe = onSnapshot(\n    q,\n    (snapshot) => {\n      setMessages(\n        snapshot.docs.map((d) => ({\n          id: d.id,\n          ...d.data()\n        }))\n      );\n    }\n  );\n\n  return () => unsubscribe();\n}, []);"
    }
  }, {
    showPreview: true,
    group: "5",
    title: "Firestore Security Rules Configuration",
    description: "Enforce that users can only read and write their own documents.",
    isCodeCompletion: true,
    question: {
      previewCode: "function FirestoreSecurityRulesGate() {\n  const [authUid, setAuthUid] = React.useState('alex_99');\n  const targetDocUid = 'alex_99';\n  const isAllowed = authUid === targetDocUid;\n\n  return (\n    <div style={{ padding: '6px 4px', fontFamily: 'system-ui, sans-serif' }}>\n      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>\n        <span style={{ fontSize: 11, color: '#475569', fontWeight: 700 }}>Auth State (request.auth.uid):</span>\n        <div style={{ display: 'flex', gap: 4 }}>\n          {['alex_99', null].map(u => (\n            <button key={String(u)} onClick={() => setAuthUid(u)} style={{ border: 0, borderRadius: 5, padding: '3px 6px', fontSize: 10.5, cursor: 'pointer', background: authUid === u ? '#0f172a' : '#e2e8f0', color: authUid === u ? 'white' : '#334155', fontWeight: 600 }}>{u ? 'user: alex_99' : 'Anonymous / Null'}</button>\n          ))}\n        </div>\n      </div>\n      <div style={{ background: isAllowed ? '#f0fdf4' : '#fef2f2', border: `1.5px solid ${isAllowed ? '#86efac' : '#fca5a5'}`, padding: '6px 10px', borderRadius: 7, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>\n        <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#0f172a' }}>WRITE /users/{targetDocUid}</span>\n        <span style={{ fontSize: 10.5, fontWeight: 700, color: isAllowed ? '#15803d' : '#b91c1c' }}>\n          {isAllowed ? '\uD83D\uDFE2 ALLOWED (200 OK)' : '\uD83D\uDD34 DENIED (403 Permission Denied)'}\n        </span>\n      </div>\n    </div>\n  );\n}",
      questionText: "Which Firestore security rule ensures that authenticated users can only read and write their own profile document?",
      options: ["match /users/{userId} {\n  allow read, write:\n    if request.auth != null &&\n       request.auth.uid == userId;\n}", "match /users/{userId} {\n  allow read, write: if true;\n}", "match /users/{userId} {\n  allow read, write:\n    if request.time > 0;\n}", "match /users/{userId} {\n  allow read: false;\n  allow write: false;\n}"],
      answer: "match /users/{userId} {\n  allow read, write:\n    if request.auth != null &&\n       request.auth.uid == userId;\n}"
    }
  }, {
    group: "5",
    title: "Open Response: Frontend Security and Secrets",
    description: "Explain why server secrets must never be embedded in client-side bundles.",
    isText: true,
    question: {
      questionText: "Why is it dangerous to embed private API keys, database credentials, or secret signing tokens inside client-side frontend code or environment variables?"
    }
  }, {
    group: "5",
    title: "Best Implementation: Client Environment Variables",
    description: "Read public Firebase client configuration correctly in a Vite application.",
    isBestImplementation: true,
    question: {
      questionText: "Which snippet correctly reads public Firebase client configuration in Vite, where VITE_* values are bundled and visible to users?",
      options: ["const firebaseConfig = {\n  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,\n  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID\n};", "const firebaseConfig = {\n  apiKey: process.env.SECRET_PRIVATE_KEY\n};", "const firebaseConfig = window.env;", "const firebaseConfig = {\n  apiKey: document.cookie\n};"],
      answer: "const firebaseConfig = {\n  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,\n  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID\n};"
    }
  }, {
    group: "5",
    title: "Locating Unhandled Auth Popup Error",
    description: "Identify the line where a popup error is logged when the user closes the login window.",
    isRelevantLine: true,
    question: {
      questionText: "Select the line where the catch block intercepts user popup cancellation:",
      code: "const handleLogin = async () => {\n  try {\n    await signInWithPopup(auth, provider);\n  } catch (error) {\n    console.warn('Login failed:', error.message);\n  }\n};",
      answer: 5
    }
  }, {
    group: "5",
    title: "Git Branching and Collaboration Actions",
    description: "Match Git branch management commands with their specific development actions.",
    isMatchPairs: true,
    question: {
      questionText: "Match each Git branch workflow command to its exact operation:",
      pairs: [{
        left: "git checkout -b feature",
        right: "Creates and switches to a new feature branch"
      }, {
        left: "git merge feature",
        right: "Combines feature branch commits into the current branch"
      }, {
        left: "git branch -d feature",
        right: "Deletes a local branch that is already merged"
      }, {
        left: "git pull origin main",
        right: "Fetches and merges latest remote commits"
      }],
      answer: {
        "git checkout -b feature": "Creates and switches to a new feature branch",
        "git merge feature": "Combines feature branch commits into the current branch",
        "git branch -d feature": "Deletes a local branch that is already merged",
        "git pull origin main": "Fetches and merges latest remote commits"
      }
    }
  }, {
    group: "5",
    title: "Fixing Memory Leak in Firebase Auth Listener",
    description: "Return the unsubscribe callback from useEffect to stop listening on unmount.",
    isFixBug: true,
    question: {
      questionText: "Fix the useEffect hook below so it cleans up the auth state listener when the component unmounts:",
      starterCode: "useEffect(() => {\n  const unsubscribe = onAuthStateChanged(auth, setUser);\n}, []);",
      answer: "useEffect(() => {\n  const unsubscribe = onAuthStateChanged(auth, setUser);\n  return () => unsubscribe();\n}, []);",
      tests: ["Returns cleanup function () => unsubscribe()", "Prevents memory leak on unmount"]
    }
  }, {
    group: "5",
    title: "Terminal Practice: Starting Local Dev Server",
    description: "Start the local development server using npm run dev.",
    isCode: true,
    isTerminal: true,
    question: {
      questionText: "In a Bash terminal, enter the command to start your local project dev server using npm"
    }
  }, {
    group: "5",
    title: "CI/CD Deployment Pipeline Stages",
    description: "Order the standard automated stages of Continuous Integration and Deployment.",
    isSelectOrder: true,
    question: {
      questionText: "Arrange the chronological order of automated CI/CD pipeline steps:",
      options: ["1. Developer pushes commit to GitHub", "2. CI pipeline runs automated test suite", "3. Build tool compiles optimized production bundle", "4. CD pipeline deploys artifacts to global CDN hosting edge"],
      answer: ["1. Developer pushes commit to GitHub", "2. CI pipeline runs automated test suite", "3. Build tool compiles optimized production bundle", "4. CD pipeline deploys artifacts to global CDN hosting edge"]
    }
  }, {
    group: "5",
    title: "Refactoring Firebase Calls to Dedicated Service Layer",
    description: "Extract inline database operations into an isolated reusable service function.",
    isRefactoringChallenge: true,
    question: {
      questionText: "Refactor the inline Firestore write into an isolated addPost service function:",
      starterCode: "function handleSave(text) {\n  addDoc(\n    collection(db, 'posts'),\n    { text, date: Date.now() }\n  );\n}",
      answer: "export const addPost = (text) => {\n  return addDoc(\n    collection(db, 'posts'),\n    { text, date: Date.now() }\n  );\n};",
      tests: ["Exports standalone addPost function", "Returns promise from addDoc"]
    }
  }, {
    group: "5",
    title: "Production Monitoring and Crash Reporting",
    description: "Select key operational metrics to monitor after deploying a web app.",
    isMultipleAnswerChoice: true,
    question: {
      questionText: "Select all vital metrics and tools used to monitor live web applications:",
      options: ["Real-time client-side JavaScript error tracking (e.g. Sentry)", "API latency and response time percentiles (p95 / p99)", "Core Web Vitals and Largest Contentful Paint (LCP)", "Database read/write quotas and query execution times", "Physical temperature of the user's laptop screen"],
      answer: ["Real-time client-side JavaScript error tracking (e.g. Sentry)", "API latency and response time percentiles (p95 / p99)", "Core Web Vitals and Largest Contentful Paint (LCP)", "Database read/write quotas and query execution times"]
    }
  }, {
    group: "5",
    title: "Code Tracing: Full-Stack Auth and Query Sequence",
    description: "Trace client authentication checking before querying protected documents.",
    isCodeTracing: true,
    question: {
      questionText: "Predict the authorization result after checking authentication, verification, and document ownership:",
      code: "const user = { uid: 'u1', verified: true };\nconst documentOwnerId = 'u1';\nconst canEdit = Boolean(\n  user &&\n  user.verified &&\n  user.uid === documentOwnerId\n);\nconsole.log(canEdit ? 'Query allowed' : 'Query blocked');",
      options: ["Query allowed", "Query blocked", "Guest - false", "undefined"],
      answer: "Query allowed"
    }
  }, {
    group: "5",
    title: "Build Your App",
    isConversationReview: true,
    description: "Celebrate how your app grew from an idea into a connected, release-ready full-stack project.",
    question: {
      questionText: "Your project has reached its release-ready milestone. Let's celebrate the full journey!",
      range: [130, 149]
    }
  }],
  es: [{
    group: "introducción",
    title: "Introducción al Desarrollo de Software",
    isStudyGuide: true,
    description: "Familiarízate con los fundamentos para mejorar la calidad de tu aprendizaje antes de avanzar.",
    question: {
      questionText: "Lee sobre los fundamentos del software en la guía de estudio antes de comenzar.",
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

And that's it. In the last example, we have used a library called React, which gives us access to special functions specialized for rendering elements on a screen. But it follows the same thought process as above.

### Conclusion
Remember that failing faster is in your best interest when learning new software skills. This one-page document will be available within the application. There are also many other features to help on your journey, but I will leave that to your exploration of the platform and everything it has to offer.

Stay focused and good luck with the rest!

                `
    }
  }, {
    group: "tutorial",
    title: "Opción Múltiple",
    description: "Elige una respuesta.",
    isMultipleChoice: true,
    question: {
      questionText: "¿Qué valor es un número de JavaScript?",
      options: ["42", "'42'", "true", "null"],
      answer: "42"
    }
  }, {
    group: "tutorial",
    title: "Respuesta Múltiple",
    description: "Elige todas las respuestas correctas.",
    isMultipleAnswerChoice: true,
    question: {
      questionText: "¿Qué palabras clave pueden declarar una variable de JavaScript?",
      options: ["let", "const", "style", "return"],
      answer: ["let", "const"]
    }
  }, {
    group: "tutorial",
    title: "Relacionar Pares",
    isMatchPairs: true,
    question: {
      questionText: "Relaciona parámetro, valor de retorno y llamada de función con la definición de cada concepto.",
      pairs: [{
        left: "Parámetro",
        right: "Valor que recibe una función"
      }, {
        left: "Valor de retorno",
        right: "Resultado que devuelve una función"
      }, {
        left: "Llamada",
        right: "Instrucción que ejecuta una función"
      }],
      choices: ["Valor que recibe una función", "Resultado que devuelve una función", "Instrucción que ejecuta una función"],
      answer: {
        Parámetro: "Valor que recibe una función",
        "Valor de retorno": "Resultado que devuelve una función",
        Llamada: "Instrucción que ejecuta una función"
      }
    }
  }, {
    group: "tutorial",
    title: "Ordenar Pasos",
    description: "Practica cómo ordenar pasos visibles según su orden de ejecución.",
    isSelectOrder: true,
    question: {
      questionText: "Ordena las instrucciones para que el programa cree un valor, lo actualice y después muestre el resultado.",
      options: ["let total = 1;", "total += 2;", "console.log(total);"],
      answer: ["let total = 1;", "total += 2;", "console.log(total);"]
    }
  }, {
    group: "tutorial",
    title: "Encontrar la Línea Relevante",
    isRelevantLine: true,
    question: {
      questionText: "¿Qué línea cambia total de 1 a 3?",
      code: "let total = 1;\ntotal += 2;\nconsole.log(total);",
      answer: [2]
    }
  }, {
    group: "tutorial",
    title: "Seguimiento de Código",
    isCodeTracing: true,
    question: {
      questionText: "Sigue la ejecución del código y determina su resultado final.",
      code: "let count = 1;\ncount += 2;\nconsole.log(count);",
      options: ["1", "2", "3", "undefined"],
      answer: "3"
    }
  }, {
    group: "tutorial",
    title: "Completar el Código",
    isFillCodeBlanks: true,
    question: {
      questionText: "Completa las partes faltantes del código.",
      template: "{{keyword}} age = 25;",
      blanks: [{
        key: "keyword",
        hint: "Una palabra para declarar variables"
      }],
      answer: {
        keyword: "const"
      }
    }
  }, {
    group: "tutorial",
    title: "Finalización de Código",
    description: "Elige una solución de código completa.",
    isCodeCompletion: true,
    question: {
      questionText: "¿Qué código declara una lista?",
      options: ["const items = ['apple'];", "const items = 'apple';", "const items = { apple: true };"],
      answer: "const items = ['apple'];"
    }
  }, {
    group: "tutorial",
    title: "Problema Parsons",
    isParsonsProblem: true,
    question: {
      questionText: "Ordena las líneas para crear una solución funcional.",
      lines: ["function greet() {", "  console.log('Hello');", "}"],
      answer: ["function greet() {", "  console.log('Hello');", "}"]
    }
  }, {
    group: "tutorial",
    title: "Respuesta Corta",
    description: "Escribe una respuesta breve.",
    isSingleLineText: true,
    question: {
      questionText: "¿Qué palabra declara una constante?",
      placeholder: "Escribe tu respuesta",
      answer: "const"
    }
  }, {
    group: "tutorial",
    title: "Respuesta Abierta",
    description: "Explica una idea con tus propias palabras.",
    isText: true,
    question: {
      questionText: "¿Por qué son útiles las variables?"
    }
  }, {
    group: "tutorial",
    title: "Escritura de Código",
    description: "Crea código a partir de un requisito.",
    isCode: true,
    isTerminal: false,
    question: {
      questionText: "Declara una variable llamada age con el valor 25.",
      starterCode: "// Escribe tu c\xF3digo aqu\xED\n",
      answer: "let age = 25;",
      tests: ["Declara la variable age con el valor 25"]
    }
  }, {
    group: "tutorial",
    title: "Práctica de Terminal",
    description: "Practica un comando en contexto.",
    isCode: true,
    isTerminal: true,
    question: {
      questionText: "Cambia al directorio new_folder."
    }
  }, {
    group: "tutorial",
    title: "Elegir la Mejor Implementación",
    isBestImplementation: true,
    question: {
      questionText: "Tienes un arreglo llamado items y una función llamada printItem. ¿Qué implementación imprime cada elemento y sigue funcionando si el arreglo crece o se reduce?",
      options: ["items.forEach(printItem);", "printItem(items[0]);\nprintItem(items[1]);", "items = printItem;"],
      answer: "items.forEach(printItem);"
    }
  }, {
    group: "tutorial",
    title: "Corregir el Error",
    isFixBug: true,
    question: {
      questionText: "Corrige el error sin cambiar el comportamiento esperado.",
      starterCode: "const score = 1;\nscore += 1;",
      answer: "let score = 1;\nscore += 1;",
      tests: ["score se puede actualizar", "El valor final de score es 2"]
    }
  }, {
    group: "tutorial",
    title: "Reto de Refactorización",
    isRefactoringChallenge: true,
    question: {
      questionText: "Mejora el código sin cambiar su comportamiento.",
      starterCode: "console.log(1);\nconsole.log(2);\nconsole.log(3);",
      tests: ["Aún imprime 1, 2 y 3", "Usa un ciclo"]
    }
  }, {
    group: "tutorial",
    title: "Construye tu Aplicación",
    description: "Construye una aplicación con lo aprendido en este capítulo.",
    isConversationReview: true,
    question: {
      questionText: "Elige y nombra una pequeña idea de aplicación. ¡La ayudaremos a crecer mientras avanzas!",
      range: [1, 16]
    }
  }, {
    group: "1",
    title: "Tipos de Datos en Programación",
    description: "Relaciona los valores literales de JavaScript con sus tipos de datos primitivos.",
    isMatchPairs: true,
    question: {
      questionText: "Relaciona cada valor literal con su tipo de dato primitivo correcto en JavaScript:",
      pairs: [{
        left: '"Hola Mundo"',
        right: "string"
      }, {
        left: "42",
        right: "number"
      }, {
        left: "true",
        right: "boolean"
      }, {
        left: "undefined",
        right: "undefined"
      }],
      choices: ["string", "number", "boolean", "undefined"],
      answer: {
        42: "number",
        '"Hola Mundo"': "string",
        true: "boolean",
        undefined: "undefined"
      }
    }
  }, {
    group: "1",
    title: "Anatom\xEDa de una Declaraci\xF3n de Funci\xF3n",
    description: "Selecciona la sintaxis correcta para declarar una funci\xF3n con par\xE1metros.",
    isCodeCompletion: true,
    question: {
      questionText: "\xBFQu\xE9 fragmento de c\xF3digo define correctamente el encabezado de la funci\xF3n para recibir el par\xE1metro nombre?",
      code: "function saludar(nombre) {\n  return 'Hola, ' + nombre;\n}",
      options: ["function saludar(nombre)", "function saludar()", "def saludar(nombre)", "fun saludar(nombre)"],
      answer: "function saludar(nombre)"
    }
  }, {
    group: "1",
    title: "Retorno de Función vs Salida de Consola",
    description: "Comprende la diferencia fundamental entre los valores de retorno y console.log.",
    isMultipleChoice: true,
    question: {
      questionText: "¿Cuál es la diferencia principal entre retornar un valor desde una función y llamar a console.log()?",
      options: ["return devuelve datos al invocador para usarlos en el código, mientras console.log solo muestra un valor para observarlo.", "console.log devuelve el valor mostrado al invocador, mientras return solo lo enseña en las herramientas de desarrollo.", "return termina todo el programa de JavaScript, mientras console.log permite continuarlo.", "Ambos dejan el valor disponible para cálculos posteriores exactamente de la misma manera."],
      answer: "return devuelve datos al invocador para usarlos en el código, mientras console.log solo muestra un valor para observarlo."
    }
  }, {
    group: "1",
    title: "Refactorización a Funciones Flecha Modernas",
    description: "Refactoriza una declaración de función clásica a una función flecha concisa de ES6.",
    isRefactoringChallenge: true,
    question: {
      questionText: "Refactoriza la función clásica sumar a una función flecha concisa en una sola línea:",
      starterCode: "function sumar(a, b) {\n  return a + b;\n}",
      answer: "const sumar = (a, b) => a + b;",
      tests: ["Devuelve 7 al pasar (3, 4)", "Utiliza la sintaxis concisa de función flecha"]
    }
  }, {
    group: "1",
    title: "Operadores de Comparación y Lógicos",
    description: "Relaciona los operadores de comparación y lógicos con su comportamiento.",
    isMatchPairs: true,
    question: {
      questionText: "Relaciona cada operador con su función de comparación lógica:",
      pairs: [{
        left: "===",
        right: "Igualdad estricta (comprueba valor y tipo de dato)"
      }, {
        left: "!==",
        right: "Desigualdad estricta (comprueba si el valor o tipo difiere)"
      }, {
        left: ">=",
        right: "Comparación mayor o igual que"
      }, {
        left: "&&",
        right: "AND lógico (verdadero solo si ambas expresiones son verdaderas)"
      }],
      choices: ["Igualdad estricta (comprueba valor y tipo de dato)", "Desigualdad estricta (comprueba si el valor o tipo difiere)", "Comparación mayor o igual que", "AND lógico (verdadero solo si ambas expresiones son verdaderas)"],
      answer: {
        "===": "Igualdad estricta (comprueba valor y tipo de dato)",
        "!==": "Desigualdad estricta (comprueba si el valor o tipo difiere)",
        ">=": "Comparación mayor o igual que",
        "&&": "AND lógico (verdadero solo si ambas expresiones son verdaderas)"
      }
    }
  }, {
    group: "1",
    title: "Construyendo un Árbol If-Else",
    description: "Ordena las líneas para crear una estructura condicional en cascada para calcular calificaciones.",
    isParsonsProblem: true,
    question: {
      questionText: "Ordena las líneas en una cadena condicional estructurada if / else if / else:",
      lines: ["if (puntaje >= 90) {", '  return "A";', "} else if (puntaje >= 80) {", '  return "B";', "} else {", '  return "C";', "}"],
      answer: ["if (puntaje >= 90) {", '  return "A";', "} else if (puntaje >= 80) {", '  return "B";', "} else {", '  return "C";', "}"]
    }
  }, {
    group: "1",
    title: "Corrigiendo un Error de Límite en Comparación",
    description: "Corrige la condición para que los 18 años se incluyan como mayor de edad.",
    isFixBug: true,
    question: {
      questionText: "Corrige la condición abajo para permitir el acceso a usuarios de 18 años o más:",
      starterCode: "function puedeIngresar(edad) {\n  if (edad > 18) {\n    return true;\n  }\n  return false;\n}",
      answer: "function puedeIngresar(edad) {\n  if (edad >= 18) {\n    return true;\n  }\n  return false;\n}",
      tests: ["puedeIngresar(18) devuelve true", "puedeIngresar(17) devuelve false"]
    }
  }, {
    group: "1",
    title: "Valores Truthy y Falsy",
    description: "Identifica todos los valores que se evalúan como falsos al convertirse a booleano en JavaScript.",
    isMultipleAnswerChoice: true,
    question: {
      questionText: "Selecciona todos los valores que son inherentemente 'falsy' (falsos) en JavaScript:",
      options: ["0", '""', "null", "undefined", "NaN", "false", '"0"', "[]", "{}"],
      answer: ["0", '""', "null", "undefined", "NaN", "false"]
    }
  }, {
    group: "1",
    title: "Cl\xE1usulas de Guarda y Retornos Tempranos",
    description: "Completa la condici\xF3n de la cl\xE1usula de guarda para detener entradas inv\xE1lidas.",
    isFillCodeBlanks: true,
    question: {
      questionText: "Completa la cl\xE1usula de guarda para retornar temprano si el monto es menor o igual a cero:",
      template: "function procesarPago(monto) {\n  if (monto {{<=}} {{0}}) {\n    return 'Monto inv\xE1lido';\n  }\n  return 'Aprobado';\n}",
      blanks: [{
        key: "<=",
        hint: "Operador de comparación que incluye igualdad"
      }, {
        key: "0",
        hint: "El valor límite"
      }],
      answer: {
        "<=": "<=",
        0: "0"
      }
    }
  }, {
    group: "1",
    title: "Práctica de Terminal: Comando Help",
    description: "Descubre la ayuda integrada en un entorno de terminal Bash.",
    isCode: true,
    isTerminal: true,
    question: {
      questionText: "En un entorno de terminal Bash, ingresa el comando help para descubrir comandos básicos."
    }
  }, {
    group: "1",
    title: "Terminaci\xF3n de Ciclos con break",
    description: "Identifica la palabra clave de control de flujo para salir temprano de ciclos.",
    isSingleLineText: true,
    question: {
      questionText: "\xBFQu\xE9 palabra clave se usa en JavaScript para terminar y salir inmediatamente de un ciclo antes de que su condici\xF3n sea falsa?",
      answer: "break"
    }
  }, {
    group: "1",
    title: "Secuencia de Ejecución de Bucles",
    description: "Ordena las fases del ciclo de vida de un bucle for durante la ejecución.",
    isSelectOrder: true,
    question: {
      questionText: "Ordena los pasos desde la configuración del bucle for hasta el final de su primera iteración válida:",
      options: ["1. Inicializar la variable contador una sola vez", "2. Evaluar la condición del bucle", "3. Ejecutar el bloque de código del cuerpo", "4. Incrementar la expresión del contador"],
      answer: ["1. Inicializar la variable contador una sola vez", "2. Evaluar la condición del bucle", "3. Ejecutar el bloque de código del cuerpo", "4. Incrementar la expresión del contador"]
    }
  }, {
    group: "1",
    title: "Escritura de C\xF3digo: Acumulador de Suma",
    description: "Escribe una funci\xF3n que recorra un arreglo para calcular su suma total.",
    isCode: true,
    question: {
      questionText: "Escribe una funci\xF3n sumarNumeros(numeros) que recorra un arreglo de n\xFAmeros y devuelva la suma total:",
      starterCode: "function sumarNumeros(numeros) {\n  // Inicia un total, recorre cada número y devuelve el resultado.\n}",
      answer: "function sumarNumeros(numeros) {\n  let total = 0;\n  for (let n of numeros) {\n    total += n;\n  }\n  return total;\n}",
      tests: ["sumarNumeros devuelve un n\xFAmero", "sumarNumeros([1, 2, 3, 4]) es igual a 10"]
    }
  }, {
    group: "1",
    title: "Mejor Implementación: Sumar Elementos de un Arreglo",
    description: "Selecciona la forma más limpia y declarativa de sumar números en JavaScript.",
    isBestImplementation: true,
    question: {
      questionText: "¿Qué implementación proporciona el enfoque más limpio y declarativo para sumar un arreglo de números?",
      options: ["const sumar = (arr) => arr.reduce((total, n) => total + n, 0);", "function sumar(arr) {\n  let total = 0;\n  for (let i = 0; i < arr.length; i++) {\n    total = total + arr[i];\n  }\n  return total;\n}", "const sumar = (arr) => {\n  let total = 0;\n  arr.forEach(n => { total += n; });\n  return total;\n};", "function sumar(arr) { return eval(arr.join('+')); }"],
      answer: "const sumar = (arr) => arr.reduce((total, n) => total + n, 0);"
    }
  }, {
    group: "1",
    title: "Seguimiento de Código: Contador en Bucles",
    description: "Rastrea el valor de la variable a través de las iteraciones.",
    isCodeTracing: true,
    question: {
      questionText: "¿Qué valor se imprimirá en la consola tras ejecutar este bucle?",
      code: "let conteo = 1;\nfor (let i = 0; i < 3; i++) {\n  conteo *= 2;\n}\nconsole.log(conteo);",
      options: ["8", "6", "4", "16"],
      answer: "8"
    }
  }, {
    group: "1",
    title: "Corrigiendo un Bucle Infinito",
    description: "Corrige el avance del contador para que el bucle termine adecuadamente.",
    isFixBug: true,
    question: {
      questionText: "Corrige la actualización del contador para que el bucle while no se congele indefinidamente:",
      starterCode: "function contarHastaTres() {\n  let i = 0;\n  while (i < 3) {\n    console.log(i);\n  }\n}",
      answer: "function contarHastaTres() {\n  let i = 0;\n  while (i < 3) {\n    console.log(i);\n    i++;\n  }\n}",
      tests: ["Incrementa i en 1 en cada iteración", "Termina tras 3 iteraciones"]
    }
  }, {
    group: "1",
    title: "Refactorizando Concatenación a Plantillas Literales",
    description: "Moderniza la unión de cadenas con comillas invertidas e interpolación.",
    isRefactoringChallenge: true,
    question: {
      questionText: "Refactoriza la concatenación abajo para usar una plantilla literal de ES6 con comillas invertidas:",
      starterCode: 'function crearSaludo(nombre, rol) {\n  return "Usuario " + nombre + " es un " + rol + ".";\n}',
      answer: "function crearSaludo(nombre, rol) {\n  return `Usuario ${nombre} es un ${rol}.`;\n}",
      tests: ['Devuelve "Usuario Alex es un Desarrollador."', "Utiliza comillas invertidas de plantilla literal"]
    }
  }, {
    group: "1",
    title: "Localizando Mutación de Arreglo",
    description: "Encuentra la línea donde ocurre la mutación no deseada.",
    isRelevantLine: true,
    question: {
      questionText: "Selecciona la línea donde se elimina el primer elemento del arreglo:",
      code: "let frutas = ['manzana', 'platano', 'cereza'];\nfrutas.push('datil');\nlet eliminado = frutas.shift();\nconsole.log(frutas);",
      answer: 3
    }
  }, {
    group: "1",
    title: "Práctica de Terminal: Creación de Directorios",
    description: "Practica la creación de una carpeta de proyecto en un entorno de línea de comandos.",
    isCode: true,
    isTerminal: true,
    question: {
      questionText: "En un entorno de terminal bash, crea un directorio llamado app usando el comando make directory."
    }
  }, {
    group: "1",
    title: "Respuesta Abierta: Ciclo For vs For...Of",
    description: "Explica las diferencias arquitect\xF3nicas entre ciclos con \xEDndice e iterables.",
    isText: true,
    question: {
      questionText: "Explica la diferencia entre iterar un arreglo usando un ciclo for tradicional con \xEDndice vs un ciclo for...of. \xBFCu\xE1ndo se necesita el ciclo con \xEDndice?"
    }
  }, {
    group: "1",
    title: "Construye tu Aplicación",
    isConversationReview: true,
    description: "Observa cómo tu app obtiene su primera lógica con variables, funciones, condiciones, bucles y arreglos.",
    question: {
      questionText: "Tu app ya puede tomar decisiones y trabajar con colecciones. ¡Agreguemos ese progreso a tu idea!",
      range: [19, 38]
    }
  }, {
    group: "2",
    title: "Literales de Objetos y Acceso a Propiedades",
    description: "Relaciona los conceptos de objetos con sus definiciones y formas de acceso.",
    isMatchPairs: true,
    question: {
      questionText: "Relaciona cada concepto de objetos en JavaScript con su descripción:",
      pairs: [{
        left: "Clave del Objeto",
        right: "El identificador con nombre para una propiedad en un objeto"
      }, {
        left: "Valor del Objeto",
        right: "Los datos almacenados en una clave de propiedad específica"
      }, {
        left: "usuario.correo",
        right: "Notación de punto para acceso directo a propiedades"
      }, {
        left: 'usuario["rol"]',
        right: "Notación de corchetes para acceso dinámico o con cadenas"
      }],
      choices: ["El identificador con nombre para una propiedad en un objeto", "Los datos almacenados en una clave de propiedad específica", "Notación de punto para acceso directo a propiedades", "Notación de corchetes para acceso dinámico o con cadenas"],
      answer: {
        "Clave del Objeto": "El identificador con nombre para una propiedad en un objeto",
        "Valor del Objeto": "Los datos almacenados en una clave de propiedad específica",
        "usuario.correo": "Notación de punto para acceso directo a propiedades",
        'usuario["rol"]': "Notación de corchetes para acceso dinámico o con cadenas"
      }
    }
  }, {
    group: "2",
    title: "Escritura de C\xF3digo: F\xE1brica de Objetos",
    description: "Escribe una funci\xF3n que construya y devuelva un objeto de usuario.",
    isCode: true,
    question: {
      questionText: "Escribe una funci\xF3n crearUsuario(nombre, rol) que devuelva un objeto con nombre, rol y la propiedad isActive en true:",
      starterCode: "function crearUsuario(nombre, rol) {\n  // Devuelve un objeto con nombre, rol e isActive.\n}",
      answer: "function crearUsuario(nombre, rol) {\n  return {\n    nombre,\n    rol,\n    isActive: true\n  };\n}",
      tests: ["crearUsuario devuelve un objeto", "crearUsuario('Ana', 'admin').isActive es true"]
    }
  }, {
    group: "2",
    title: "Refactorización a Desestructuración de Objetos",
    description: "Refactoriza lecturas con notación de punto a desestructuración limpia de objetos.",
    isRefactoringChallenge: true,
    question: {
      questionText: "Refactoriza las asignaciones manuales en una sola instrucción de desestructuración:",
      starterCode: "function obtenerInfo(producto) {\n  const titulo = producto.titulo;\n  const precio = producto.precio;\n  return `${titulo}: $${precio}`;\n}",
      answer: "function obtenerInfo(producto) {\n  const { titulo, precio } = producto;\n  return `${titulo}: $${precio}`;\n}",
      tests: ["Devuelve 'Laptop: $999'", "Utiliza la desestructuración de objetos { titulo, precio }"]
    }
  }, {
    group: "2",
    title: "El Operador Spread en Objetos (Inmutabilidad)",
    description: "Clona y actualiza propiedades sin mutar el objeto original.",
    isFillCodeBlanks: true,
    question: {
      questionText: "Completa la sintaxis spread para crear una copia de original con tema oscuro actualizado:",
      template: 'const original = { id: 1, tema: "claro" };\nconst actualizado = { {{...original}}, tema: {{"oscuro"}} };',
      blanks: [{
        key: "...original",
        label: "Propagar objeto original",
        hint: "...original"
      }, {
        key: '"oscuro"',
        label: "Valor actualizado",
        hint: '"oscuro"'
      }],
      answer: {
        "...original": "...original",
        '"oscuro"': '"oscuro"'
      }
    }
  }, {
    group: "2",
    title: "Corrigiendo Asignación en el Constructor",
    description: "Corrige la asignación en el constructor para vincular los valores a this.",
    isFixBug: true,
    question: {
      questionText: "Corrige el constructor de la clase Usuario para que los argumentos nombre y correo se guarden en la instancia:",
      starterCode: "class Usuario {\n  constructor(nombre, correo) {\n    nombre = nombre;\n    correo = correo;\n  }\n}",
      answer: "class Usuario {\n  constructor(nombre, correo) {\n    this.nombre = nombre;\n    this.correo = correo;\n  }\n}",
      tests: ["new Usuario('Sam', 's@dev.io').nombre es igual a 'Sam'", "Utiliza this.nombre y this.correo"]
    }
  }, {
    group: "2",
    title: "Instanciación de Clases con new",
    description: "Comprende el ciclo de vida de crear una instancia a partir de una clase.",
    isMultipleChoice: true,
    question: {
      questionText: "¿Qué sucede al ejecutar const estudiante = new Usuario('Maya', 'maya@dev.io')?",
      options: ["Se crea un nuevo objeto en memoria, se ejecuta su constructor con 'this' vinculado a la instancia y se devuelve el objeto.", "La clase Usuario se elimina y se reemplaza por una función básica.", "El código compila la clase a una cadena JSON estática en disco.", "Se invoca la clase sin asignar propiedades internas."],
      answer: "Se crea un nuevo objeto en memoria, se ejecuta su constructor con 'this' vinculado a la instancia y se devuelve el objeto."
    }
  }, {
    group: "2",
    title: "Ciclo de Ejecuci\xF3n de Clases y M\xE9todos",
    description: "Ordena las fases cronol\xF3gicas para definir y usar instancias de clases.",
    isSelectOrder: true,
    question: {
      questionText: "Ordena las fases para definir y usar una instancia de clase en orden cronol\xF3gico de ejecuci\xF3n:",
      options: ["Definir el modelo de la clase con constructor y m\xE9todos", "Instanciar el objeto usando new NombreClase(args)", "El constructor inicializa las propiedades en this", "Invocar el m\xE9todo de la instancia (ej. usuario.obtenerDetalles())"],
      answer: ["Definir el modelo de la clase con constructor y m\xE9todos", "Instanciar el objeto usando new NombreClase(args)", "El constructor inicializa las propiedades en this", "Invocar el m\xE9todo de la instancia (ej. usuario.obtenerDetalles())"]
    }
  }, {
    group: "2",
    title: "Localizando Pérdida de Contexto en Métodos",
    description: "Identifica la línea donde this se convierte en undefined al desacoplar el método.",
    isRelevantLine: true,
    question: {
      questionText: "Selecciona la línea donde desacoplar el método de la instancia provoca la pérdida del contexto 'this':",
      code: "class CuentaBancaria {\n  constructor(saldo) {\n    this.saldo = saldo;\n  }\n  depositar(monto) {\n    this.saldo += monto;\n  }\n}\nconst cuenta = new CuentaBancaria(100);\nconst depositoDesacoplado = cuenta.depositar;\ndepositoDesacoplado(50);\nconsole.log(cuenta.saldo);",
      answer: 10
    }
  }, {
    group: "2",
    title: "Mejor Implementación: Transformación de Arreglos de Objetos",
    description: "Elige la forma más limpia de filtrar usuarios activos y extraer sus nombres.",
    isBestImplementation: true,
    question: {
      questionText: "¿Qué encadenamiento de métodos filtra más limpiamente los usuarios activos y extrae sus nombres?",
      options: ["const nombres = usuarios\n  .filter((u) => u.estaActivo)\n  .map((u) => u.nombre);", "const nombres = [];\nfor (let i = 0; i < usuarios.length; i++) {\n  if (usuarios[i].estaActivo) {\n    nombres.push(usuarios[i].nombre);\n  }\n}", "const nombres = usuarios\n  .map((u) => (u.estaActivo ? u.nombre : null))\n  .filter(Boolean);", "const nombres = usuarios.reduce((acc, u) => {\n  return u.estaActivo ? [...acc, u.nombre]\n    :\n    acc;\n}, []);"],
      answer: "const nombres = usuarios\n  .filter((u) => u.estaActivo)\n  .map((u) => u.nombre);"
    }
  }, {
    group: "2",
    title: "Respuesta Corta: M\xE9todo de Filtrado en Arreglos",
    description: "Identifica el m\xE9todo de arreglos para filtrar elementos con un predicado.",
    isSingleLineText: true,
    question: {
      questionText: "\xBFQu\xE9 m\xE9todo nativo de arreglos en JavaScript devuelve un nuevo arreglo con todos los elementos que cumplen con una funci\xF3n de prueba?",
      answer: "filter"
    }
  }, {
    group: "2",
    title: "Inmutabilidad de Objetos y Reglas de Propiedades",
    description: "Selecciona todas las características verdaderas de los objetos en JavaScript.",
    isMultipleAnswerChoice: true,
    question: {
      questionText: "Selecciona todas las afirmaciones verdaderas sobre objetos y referencias en JavaScript:",
      options: ["Las variables de objetos guardan una referencia de memoria hacia el objeto, no los datos en sí", "Modificar una propiedad anidada en un objeto clonado superficialmente afecta a ambos", "const evita que la variable sea reasignada, pero las propiedades del objeto aún pueden modificarse", "Los objetos solo pueden almacenar valores de cadena, nunca funciones ni arreglos", "Las claves de objeto deben ser números enteros comenzando en el índice 0"],
      answer: ["Las variables de objetos guardan una referencia de memoria hacia el objeto, no los datos en sí", "Modificar una propiedad anidada en un objeto clonado superficialmente afecta a ambos", "const evita que la variable sea reasignada, pero las propiedades del objeto aún pueden modificarse"]
    }
  }, {
    group: "2",
    title: "Seguimiento de Código: Mutación por Referencia de Objetos",
    description: "Rastrea las referencias que apuntan al mismo objeto en memoria.",
    isCodeTracing: true,
    question: {
      questionText: "¿Qué se imprimirá para usuarioA.puntaje tras ejecutar este código?",
      code: "let usuarioA = { puntaje: 10 };\nlet usuarioB = usuarioA;\nusuarioB.puntaje = 25;\nconsole.log(usuarioA.puntaje);",
      options: ["25", "10", "undefined", "NaN"],
      answer: "25"
    }
  }, {
    group: "2",
    title: "Herencia de Clases con extends y super",
    description: "Organiza la extensión de clases y la llamada al constructor padre.",
    isParsonsProblem: true,
    question: {
      questionText: "Ordena las líneas para crear una clase Empleado que herede de Persona:",
      lines: ["class Empleado extends Persona {", "  constructor(nombre, puesto) {", "    super(nombre);", "    this.puesto = puesto;", "  }", "}"],
      answer: ["class Empleado extends Persona {", "  constructor(nombre, puesto) {", "    super(nombre);", "    this.puesto = puesto;", "  }", "}"]
    }
  }, {
    group: "2",
    title: "Respuesta Abierta: Inmutabilidad en JavaScript",
    description: "Explica por qu\xE9 evitar la mutaci\xF3n directa de objetos es cr\xEDtico.",
    isText: true,
    question: {
      questionText: "\xBFPor qu\xE9 es importante la inmutabilidad al modificar objetos o arreglos en aplicaciones de JavaScript? Explica qu\xE9 problemas genera la mutaci\xF3n directa."
    }
  }, {
    group: "2",
    title: "Encadenamiento Opcional para Acceso Seguro a Propiedades",
    description: "Selecciona el operador que lee propiedades anidadas de forma segura.",
    isCodeCompletion: true,
    question: {
      questionText: "\xBFQu\xE9 operador accede de forma segura a propiedades anidadas cuando una propiedad intermedia puede ser null o undefined?",
      code: "const ciudad = usuario?.perfil?.direccion?.ciudad;",
      options: ["?.", "??", "||", "&&"],
      answer: "?."
    }
  }, {
    group: "2",
    title: "Seguimiento de Código: Métodos de Objeto y Estado",
    description: "Rastrea la instanciación de clases y métodos para calcular el estado interno.",
    isCodeTracing: true,
    question: {
      questionText: "Predice el valor final de count tras llamar a increment(3):",
      code: "class Contador {\n  constructor(inicio) {\n    this.count = inicio;\n  }\n  increment(en = 1) {\n    this.count += en;\n    return this.count;\n  }\n}\n\nconst c = new Contador(5);\nc.increment(3);\nconsole.log(c.count);",
      options: ["8", "5", "3", "undefined"],
      answer: "8"
    }
  }, {
    group: "2",
    title: "Práctica de Terminal: Comando Echo",
    description: "Emite mensajes en el terminal Bash usando el comando echo.",
    isCode: true,
    isTerminal: true,
    question: {
      questionText: "En un entorno de terminal Bash, ingresa el comando echo para imprimir 'Data ready'"
    }
  }, {
    group: "2",
    title: "Construye tu Aplicación",
    isConversationReview: true,
    description: "Observa cómo tu app obtiene un modelo de datos estructurado con objetos, clases y colecciones.",
    question: {
      questionText: "Tu app ya tiene datos estructurados. ¡Conectemos objetos y colecciones con tu idea!",
      range: [40, 56]
    }
  }, {
    group: "3",
    title: "Fase HTML y CSS: Elementos Semánticos",
    description: "Relaciona los elementos HTML semánticos con sus funciones de diseño y contenido.",
    isMatchPairs: true,
    showPreview: true,
    question: {
      questionText: "Relaciona cada elemento HTML5 con su función semántica:",
      previewCode: "function VistaPreviaDisenoSemantico() {\n  const [pestanaActiva, setPestanaActiva] = React.useState('Inicio');\n  return (\n    <div style={{ fontFamily: 'system-ui, sans-serif', fontSize: 12, border: '1px solid #cbd5e1', borderRadius: 8, overflow: 'hidden' }}>\n      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a', color: 'white', padding: '5px 10px' }}>\n        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>\n          <span style={{ background: '#ec4899', color: 'white', padding: '1px 5px', borderRadius: 4, fontSize: 9.5, fontWeight: 700 }}>&lt;header&gt;</span>\n          <strong style={{ fontSize: 12, color: '#f472b6' }}>Mi Sitio Web</strong>\n        </div>\n        <nav style={{ display: 'flex', gap: 4 }}>\n          {['Inicio', 'Art\xEDculos'].map(t => (\n            <button key={t} onClick={() => setPestanaActiva(t)} style={{ border: 0, borderRadius: 4, padding: '2px 7px', background: pestanaActiva === t ? '#ec4899' : '#334155', color: 'white', fontSize: 10.5, cursor: 'pointer', fontWeight: 600 }}>{t}</button>\n          ))}\n        </nav>\n      </header>\n\n      <main style={{ padding: '6px 8px', background: '#f8fafc' }}>\n        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>\n          <span style={{ background: '#3b82f6', color: 'white', padding: '1px 5px', borderRadius: 4, fontSize: 9.5, fontWeight: 700 }}>&lt;main&gt;</span>\n          <span style={{ fontSize: 10, color: '#64748b' }}>Cuerpo Principal del Documento</span>\n        </div>\n        <section style={{ background: 'white', border: '1.5px dashed #10b981', borderRadius: 6, padding: '6px 8px' }}>\n          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>\n            <span style={{ background: '#10b981', color: 'white', padding: '1px 5px', borderRadius: 4, fontSize: 9, fontWeight: 700 }}>&lt;section&gt;</span>\n            <span style={{ fontSize: 11, color: '#0f172a', fontWeight: 700 }}>Contenido Tem\xE1tico de {pestanaActiva}</span>\n          </div>\n          <p style={{ margin: 0, fontSize: 10.5, color: '#64748b' }}>Una secci\xF3n tem\xE1tica agrupada por tema.</p>\n        </section>\n      </main>\n\n      <footer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a', color: '#94a3b8', padding: '4px 10px', fontSize: 10 }}>\n        <span style={{ background: '#f59e0b', color: '#0f172a', padding: '1px 5px', borderRadius: 4, fontSize: 9, fontWeight: 700 }}>&lt;footer&gt;</span>\n        <span>\xA9 2026 Est\xE1ndares HTML Sem\xE1nticos</span>\n      </footer>\n    </div>\n  );\n}",
      pairs: [{
        left: "<header>",
        right: "Contenido introductorio, título del sitio o navegación superior"
      }, {
        left: "<main>",
        right: "El contenido principal y único del cuerpo del documento"
      }, {
        left: "<section>",
        right: "Una agrupación temática independiente de contenido relacionado"
      }, {
        left: "<footer>",
        right: "Información de cierre, avisos de copyright o enlaces del autor"
      }],
      choices: ["Contenido introductorio, título del sitio o navegación superior", "El contenido principal y único del cuerpo del documento", "Una agrupación temática independiente de contenido relacionado", "Información de cierre, avisos de copyright o enlaces del autor"],
      answer: {
        "<header>": "Contenido introductorio, título del sitio o navegación superior",
        "<main>": "El contenido principal y único del cuerpo del documento",
        "<section>": "Una agrupación temática independiente de contenido relacionado",
        "<footer>": "Información de cierre, avisos de copyright o enlaces del autor"
      }
    }
  }, {
    group: "3",
    title: "Atributos y Entradas en HTML",
    description: "Completa un elemento input con el tipo y texto de marcador de posición correctos.",
    isFillCodeBlanks: true,
    showPreview: true,
    question: {
      questionText: "Completa la etiqueta input para aceptar correos electrónicos con un texto de ayuda:",
      previewCode: "function VistaPreviaEntradaCorreo() {\n  const [correo, setCorreo] = React.useState('');\n  const estaListo = correo.includes('@') && correo.includes('.');\n  return (\n    <div style={{ padding: '6px 4px', fontFamily: 'system-ui, sans-serif' }}>\n      <label htmlFor=\"preview-email\" style={{ display: 'block', marginBottom: 4, fontSize: 11.5, fontWeight: 700, color: '#334155' }}>Correo electr\xF3nico</label>\n      <input id=\"preview-email\" type=\"email\" value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder=\"nombre@ejemplo.com\" required style={{ width: '100%', boxSizing: 'border-box', padding: '7px 10px', fontSize: 13, borderRadius: 7, border: `1.5px solid ${estaListo ? '#10b981' : '#cbd5e1'}`, outline: 'none', background: '#f8fafc' }} />\n      <p style={{ margin: '5px 0 0', color: estaListo ? '#047857' : '#64748b', fontSize: 11, fontWeight: 500 }}>{estaListo ? '\u2713 Listo para enviar' : 'Ingresa un correo con @ y dominio'}</p>\n    </div>\n  );\n}",
      template: '<input\n  type="{{email}}"\n  placeholder="{{Ingresa tu correo}}"\n  required\n/>',
      blanks: [{
        key: "email",
        label: "Tipo de entrada",
        hint: "email"
      }, {
        key: "Ingresa tu correo",
        label: "Texto de marcador de posición",
        hint: "Ingresa tu correo"
      }],
      answer: {
        email: "email",
        "Ingresa tu correo": "Ingresa tu correo"
      }
    }
  }, {
    group: "3",
    title: "Mejor Implementación: Elementos Interactivos Accesibles",
    description: "Selecciona el elemento accesible para activar acciones interactivas.",
    isBestImplementation: true,
    showPreview: true,
    question: {
      questionText: "¿Qué implementación proporciona soporte nativo de accesibilidad por teclado y lectores de pantalla para un botón?",
      previewCode: "function AccessibleButtonPreview() {\n  const [enviado, setEnviado] = React.useState(0);\n  return (\n    <div style={{ padding: '8px 4px', fontFamily: 'system-ui, sans-serif', textAlign: 'center' }}>\n      <button\n        type=\"button\"\n        onClick={() => setEnviado(c => c + 1)}\n        style={{ background: '#ec4899', color: 'white', border: 0, padding: '7px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 13, boxShadow: '0 2px 8px rgba(236,72,153,.25)' }}\n      >\n        Enviar\n      </button>\n      <p aria-live=\"polite\" style={{ margin: '6px 0 0', color: '#475569', fontSize: 11.5 }}>\n        {enviado ? `Enviado ${enviado} ${enviado === 1 ? 'vez' : 'veces'}` : 'Bot\xF3n interactivo accesible con teclado y ARIA'}\n      </p>\n    </div>\n  );\n}",
      options: ['<button\n  type="button"\n  onClick={handleClick}\n>\n  Enviar\n</button>', "<div onClick={handleClick}>\n  Enviar\n</div>", "<span onClick={handleClick}>\n  Enviar\n</span>", '<a\n  href="#"\n  onClick={handleClick}\n>\n  Enviar\n</a>'],
      answer: '<button\n  type="button"\n  onClick={handleClick}\n>\n  Enviar\n</button>'
    }
  }, {
    group: "3",
    title: "Corrigiendo Texto Alternativo Faltante",
    description: "Agrega texto alternativo significativo para que una imagen HTML sea accesible.",
    isFixBug: true,
    question: {
      questionText: "Corrige la imagen HTML para que un lector de pantalla pueda comunicar lo que representa:",
      starterCode: '<img src="perfil.jpg">',
      answer: '<img src="perfil.jpg" alt="Perfil del usuario">',
      tests: ["Incluye un atributo alt significativo", "Conserva la fuente original de la imagen"]
    }
  }, {
    group: "3",
    title: "Estructura de una Tarjeta HTML Semántica",
    description: "Completa las etiquetas sem\xE1nticas de HTML para crear una tarjeta de producto interactiva.",
    isFillCodeBlanks: true,
    showPreview: true,
    question: {
      questionText: "Completa los elementos sem\xE1nticos de HTML para armar la tarjeta de producto:",
      previewCode: "function VistaPreviaTarjetaProducto() {\n  const [comprado, setComprado] = React.useState(false);\n  return (\n    <article style={{ padding: '8px 12px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 8, fontFamily: 'system-ui, sans-serif', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>\n      <div>\n        <h2 style={{ margin: '0 0 2px', fontSize: 14, color: '#0f172a', fontWeight: 700 }}>T\xEDtulo del Producto</h2>\n        <p style={{ margin: 0, color: '#64748b', fontSize: 11.5 }}>Descripci\xF3n del Producto</p>\n      </div>\n      <button\n        type=\"button\"\n        onClick={() => setComprado(!comprado)}\n        style={{ border: 0, borderRadius: 7, padding: '7px 14px', cursor: 'pointer', background: comprado ? '#10b981' : '#ec4899', color: 'white', fontWeight: 700, fontSize: 12, flexShrink: 0 }}\n      >\n        {comprado ? 'Comprado \u2713' : 'Comprar Ahora'}\n      </button>\n    </article>\n  );\n}",
      template: '<article class="tarjeta">\n  <{{h2}}>T\xEDtulo del Producto</{{h2}}>\n  <p>Descripci\xF3n del Producto</p>\n  <{{button}}>Comprar Ahora</{{button}}>\n</article>',
      blanks: [{
        key: "h2",
        hint: "Un encabezado de segundo nivel"
      }, {
        key: "button",
        hint: "El control interactivo nativo"
      }],
      answer: {
        h2: "h2",
        button: "button"
      }
    }
  }, {
    showPreview: true,
    group: "3",
    title: "Capas del Modelo de Caja en CSS",
    description: "Ordena las capas concéntricas del modelo de caja desde el interior hacia el exterior.",
    isSelectOrder: true,
    question: {
      previewCode: "function ExploradorModeloCajaCSS() {\n  const [capaActiva, setCapaActiva] = React.useState('padding');\n  const capas = {\n    margin: { color: '#fb923c', desc: 'Margin: Espacio exterior transparente alrededor del elemento' },\n    border: { color: '#fbbf24', desc: 'Border: Borde visible que rodea el relleno y contenido' },\n    padding: { color: '#34d399', desc: 'Padding: Espacio interior entre el contenido y el borde' },\n    content: { color: '#60a5fa', desc: 'Content: El texto, imagen o elemento hijo real' }\n  };\n  return (\n    <div style={{ padding: '6px 4px', fontFamily: 'system-ui, sans-serif' }}>\n      <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>\n        {Object.keys(capas).map(k => (\n          <button key={k} onClick={() => setCapaActiva(k)} style={{ flex: 1, border: 0, borderRadius: 5, padding: '3px 6px', fontSize: 10.5, fontWeight: 700, textTransform: 'capitalize', cursor: 'pointer', background: capaActiva === k ? capas[k].color : '#e2e8f0', color: capaActiva === k ? '#0f172a' : '#475569' }}>{k}</button>\n        ))}\n      </div>\n      <div style={{ background: '#f8fafc', border: `2px solid ${capas[capaActiva].color}`, borderRadius: 8, padding: '6px 10px', textAlign: 'center' }}>\n        <span style={{ fontSize: 11, fontWeight: 700, color: '#0f172a' }}>CAPA {capaActiva.toUpperCase()}</span>\n        <p style={{ margin: 0, fontSize: 10.5, color: '#64748b' }}>{capas[capaActiva].desc}</p>\n      </div>\n    </div>\n  );\n}",
      questionText: "Ordena las capas del modelo de caja en CSS de adentro hacia afuera:",
      options: ["1. Área de contenido (dimensiones de texto o imagen)", "2. Padding (espacio alrededor del contenido dentro del borde)", "3. Border (línea que rodea el padding)", "4. Margin (espacio exterior fuera del borde entre elementos)"],
      answer: ["1. Área de contenido (dimensiones de texto o imagen)", "2. Padding (espacio alrededor del contenido dentro del borde)", "3. Border (línea que rodea el padding)", "4. Margin (espacio exterior fuera del borde entre elementos)"]
    }
  }, {
    group: "3",
    title: "Propiedades de Tamaño y Espaciado en CSS",
    description: "Relaciona las propiedades de espaciado en CSS con su impacto dimensional.",
    isMatchPairs: true,
    question: {
      questionText: "Relaciona cada propiedad de diseño en CSS con su efecto en el elemento:",
      pairs: [{
        left: "box-sizing: border-box",
        right: "Incluye padding y borde dentro del ancho declarado"
      }, {
        left: "margin: 0 auto",
        right: "Centra horizontalmente un elemento de bloque con ancho definido"
      }, {
        left: "gap: 16px",
        right: "Define el espacio entre elementos hijos dentro de flex o grid"
      }, {
        left: "overflow: hidden",
        right: "Recorta el contenido hijo que exceda los límites del contenedor"
      }],
      choices: ["Incluye padding y borde dentro del ancho declarado", "Centra horizontalmente un elemento de bloque con ancho definido", "Define el espacio entre elementos hijos dentro de flex o grid", "Recorta el contenido hijo que exceda los límites del contenedor"],
      answer: {
        "box-sizing: border-box": "Incluye padding y borde dentro del ancho declarado",
        "margin: 0 auto": "Centra horizontalmente un elemento de bloque con ancho definido",
        "gap: 16px": "Define el espacio entre elementos hijos dentro de flex o grid",
        "overflow: hidden": "Recorta el contenido hijo que exceda los límites del contenedor"
      }
    }
  }, {
    group: "3",
    title: "Respuesta Corta: Funci\xF3n de Dimensionamiento Fluido en CSS",
    description: "Identifica la funci\xF3n matem\xE1tica de CSS para dise\xF1o responsivo fluido.",
    isSingleLineText: true,
    question: {
      questionText: "\xBFQu\xE9 funci\xF3n matem\xE1tica de CSS acepta un valor m\xEDnimo, preferido y m\xE1ximo para lograr tama\xF1os fluidos sin media queries?",
      answer: "clamp()"
    }
  }, {
    group: "3",
    title: "Reglas de Desbordamiento y Tama\xF1o en CSS",
    description: "Selecciona todas las t\xE9cnicas v\xE1lidas para evitar desbordamientos horizontales.",
    isMultipleAnswerChoice: true,
    question: {
      questionText: "\xBFQu\xE9 t\xE9cnicas ayudan a prevenir desbordamientos horizontales no deseados en pantallas m\xF3viles?",
      options: ["Usar box-sizing: border-box globalmente en todos los elementos", "Usar max-width: 100% en im\xE1genes y contenedores multimedia", "Evitar anchos fijos grandes en p\xEDxeles (usar porcentajes, flex o rem)", "Colocar min-width: 2000px en todos los contenedores"],
      answer: ["Usar box-sizing: border-box globalmente en todos los elementos", "Usar max-width: 100% en im\xE1genes y contenedores multimedia", "Evitar anchos fijos grandes en p\xEDxeles (usar porcentajes, flex o rem)"]
    }
  }, {
    group: "3",
    title: "Alineación de Barra de Navegación con Flexbox",
    description: "Ordena las reglas de flexbox para crear una barra de navegación horizontal espaciada.",
    isParsonsProblem: true,
    showPreview: true,
    question: {
      questionText: "Ordena las reglas de CSS flexbox para crear una barra de navegación con espacio entre elementos:",
      previewCode: "function VistaPreviaNavbarFlex() {\n  const [activo, setActivo] = React.useState('Docs');\n  return (\n    <nav\n      style={{\n        display: 'flex',\n        justifyContent: 'space-between',\n        alignItems: 'center',\n        padding: '12px 24px',\n        background: '#0f172a',\n        borderRadius: 8,\n        color: 'white',\n        fontFamily: 'system-ui, sans-serif'\n      }}\n    >\n      <strong style={{ color: '#f472b6', fontSize: 14, fontWeight: 700 }}>Sunset</strong>\n      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>\n        {['Docs', 'Proyectos', 'Perfil'].map((item) => (\n          <button\n            key={item}\n            type=\"button\"\n            onClick={() => setActivo(item)}\n            style={{\n              border: 0,\n              borderRadius: 6,\n              padding: '6px 12px',\n              cursor: 'pointer',\n              background: activo === item ? '#ec4899' : '#1e293b',\n              color: 'white',\n              fontSize: 12,\n              fontWeight: 600,\n              transition: 'background 0.15s ease'\n            }}\n          >\n            {item}\n          </button>\n        ))}\n      </div>\n    </nav>\n  );\n}",
      lines: [".navbar {", "  display: flex;", "  justify-content: space-between;", "  align-items: center;", "  padding: 12px 24px;", "}"],
      answer: [".navbar {", "  display: flex;", "  justify-content: space-between;", "  align-items: center;", "  padding: 12px 24px;", "}"]
    }
  }, {
    group: "3",
    title: "Escritura de C\xF3digo: Input Controlado en React",
    description: "Escribe un componente funcional de React que renderice un input controlado.",
    isCode: true,
    showPreview: true,
    question: {
      questionText: "Escribe un componente SearchInput({ query, setQuery }) que enlace value y onChange para controlar un input:",
      previewCode: "function ControlledSearchPreview() {\n  const [consulta, setConsulta] = React.useState('');\n  const proyectos = ['Portafolio', 'App Clima', 'Gestor Tareas'];\n  const coincidencias = proyectos.filter(p => p.toLowerCase().includes(consulta.toLowerCase()));\n  return (\n    <div style={{ padding: '6px 4px', fontFamily: 'system-ui, sans-serif' }}>\n      <input type=\"search\" value={consulta} onChange={(e) => setConsulta(e.target.value)} placeholder=\"Filtrar proyectos...\" style={{ width: '100%', boxSizing: 'border-box', padding: '6px 10px', fontSize: 12.5, border: '1.5px solid #cbd5e1', borderRadius: 7, outline: 'none' }} />\n      <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 5 }}>\n        {coincidencias.map(p => <span key={p} style={{ padding: '3px 7px', borderRadius: 999, background: '#fce7f3', color: '#9d174d', fontSize: 11, fontWeight: 600 }}>{p}</span>)}\n        {!coincidencias.length && <span style={{ color: '#64748b', fontSize: 11 }}>Sin coincidencias</span>}\n      </div>\n    </div>\n  );\n}",
      starterCode: "function SearchInput({ query, setQuery }) {\n  // Devuelve un input de texto controlado.\n}",
      answer: 'function SearchInput({ query, setQuery }) {\n  return (\n    <input\n      type="text"\n      value={query}\n      onChange={(e) => setQuery(e.target.value)}\n      placeholder="Buscar..."\n    />\n  );\n}',
      tests: ["Renderiza un elemento input", "Enlaza value a query y actualiza mediante onChange"]
    }
  }, {
    group: "3",
    title: "Función de Búsqueda en Vivo",
    description: "Completa el filtro para buscar productos por título sin distinción de mayúsculas.",
    isFillCodeBlanks: true,
    question: {
      questionText: "Completa el filtro para buscar productos por título:",
      template: "const resultados = productos.{{filter}}((p) =>\n  p.titulo\n    .{{toLowerCase}}()\n    .includes(query.toLowerCase())\n);",
      blanks: [{
        key: "filter",
        label: "Método de filtrado",
        hint: "filter"
      }, {
        key: "toLowerCase",
        label: "Conversión a minúsculas",
        hint: "toLowerCase"
      }],
      answer: {
        filter: "filter",
        toLowerCase: "toLowerCase"
      }
    }
  }, {
    group: "3",
    title: "Refactorizando a Componente Controlado",
    description: "Refactoriza lecturas directas del DOM a vinculación controlada con useState.",
    isRefactoringChallenge: true,
    question: {
      questionText: "Refactoriza la lectura imperativa de document.getElementById a un input controlado con useState:",
      starterCode: "function Formulario() {\n  const handleSubmit = () => {\n    const texto = document.getElementById('nombre').value;\n    alert(texto);\n  };\n  return <input id='nombre' />;\n}",
      answer: "function Formulario() {\n  const [nombre, setNombre] = useState('');\n  const handleSubmit = () => { alert(nombre); };\n  return <input value={nombre} onChange={e => setNombre(e.target.value)} />;\n}",
      tests: ["Utiliza useState('') para el nombre", "Vincula value y onChange al input"]
    }
  }, {
    group: "3",
    title: "Escritura de C\xF3digo: Actualizador Inmutable de Estado",
    description: "Escribe una funci\xF3n auxiliar para actualizar campos de formulario de forma inmutable.",
    isCode: true,
    question: {
      questionText: "Escribe una funci\xF3n actualizarCampo(formulario, campo, valor) que devuelva un nuevo objeto con el campo actualizado de forma inmutable:",
      starterCode: "function actualizarCampo(formulario, campo, valor) {\n  // Devuelve un objeto nuevo con el campo solicitado actualizado.\n}",
      answer: "function actualizarCampo(formulario, campo, valor) {\n  return {\n    ...formulario,\n    [campo]: valor\n  };\n}",
      tests: ["Devuelve un nuevo objeto sin mutar el original", "Actualiza la clave din\xE1mica correctamente"]
    }
  }, {
    group: "3",
    title: "Restablecimiento del Estado del Input tras el Envío",
    description: "Localiza la línea que limpia el campo de texto a una cadena vacía.",
    isRelevantLine: true,
    question: {
      questionText: "Selecciona la línea que restablece el campo a una cadena vacía tras guardar:",
      code: "const handleAddTodo = (e) => {\n  e.preventDefault();\n  if (!text.trim()) return;\n  setTodos(prev => [...prev, text]);\n  setText('');\n};",
      answer: 5
    }
  }, {
    group: "3",
    title: "Renderizado Condicional Ternario",
    description: "Renderiza componentes alternativos según una bandera booleana de autenticación.",
    isCodeCompletion: true,
    showPreview: true,
    question: {
      questionText: "¿Qué expresión JSX renderiza Dashboard cuando estaConectado es verdadero y LoginView en caso contrario?",
      previewCode: "function TernaryPreview() {\n  const [estaConectado, setEstaConectado] = React.useState(false);\n  return (\n    <div style={{ padding: '8px 4px', textAlign: 'center', fontFamily: 'system-ui, sans-serif', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>\n      <div style={{ textAlign: 'left' }}>\n        <strong style={{ color: estaConectado ? '#047857' : '#334155', fontSize: 13 }}>{estaConectado ? '\uD83D\uDC4B Panel Desbloqueado' : '\uD83D\uDD12 Inicia Sesi\xF3n'}</strong>\n        <p style={{ margin: 0, color: '#64748b', fontSize: 11 }}>{estaConectado ? '\xA1Bienvenido de nuevo!' : 'El ternario eval\xFAa la condici\xF3n.'}</p>\n      </div>\n      <button onClick={() => setEstaConectado(!estaConectado)} style={{ border: 0, borderRadius: 7, padding: '6px 12px', background: '#ec4899', color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: 12, flexShrink: 0 }}>{estaConectado ? 'Salir' : 'Entrar'}</button>\n    </div>\n  );\n}",
      options: ["{estaConectado ? <Dashboard /> : <LoginView />}", "{if (estaConectado) <Dashboard /> else <LoginView />}", "{estaConectado && <Dashboard /> || <LoginView />}", "{estaConectado ? <Dashboard /> , <LoginView />}"],
      answer: "{estaConectado ? <Dashboard /> : <LoginView />}"
    }
  }, {
    group: "3",
    title: "Reglas de Sintaxis en JSX",
    description: "Identifica las reglas sintácticas obligatorias al escribir JSX en React.",
    isMultipleAnswerChoice: true,
    question: {
      questionText: "Selecciona todas las reglas de sintaxis válidas requeridas al escribir JSX:",
      options: ["Todas las etiquetas deben cerrarse explícitamente (p. ej. <img /> o <br />)", "Los componentes deben devolver un único elemento raíz o Fragment (<>...</>)", "Usar atributos en camelCase como className y htmlFor en lugar de class y for", "Las expresiones JavaScript en JSX deben encerrarse entre llaves {}", "Los nombres de clase en HTML deben escribirse siempre en mayúsculas"],
      answer: ["Todas las etiquetas deben cerrarse explícitamente (p. ej. <img /> o <br />)", "Los componentes deben devolver un único elemento raíz o Fragment (<>...</>)", "Usar atributos en camelCase como className y htmlFor en lugar de class y for", "Las expresiones JavaScript en JSX deben encerrarse entre llaves {}"]
    }
  }, {
    group: "3",
    title: "Jerarquía de Estados de Carga",
    description: "Ordena las líneas para gestionar carga, error y contenido.",
    isParsonsProblem: true,
    question: {
      questionText: "Ordena la jerarquía de retornos condicionales para una vista asíncrona:",
      lines: ["if (cargando) return <Spinner />;", "if (error) return <MensajeError msg={error} />;", "return <ListaDatos items={datos} />;"],
      answer: ["if (cargando) return <Spinner />;", "if (error) return <MensajeError msg={error} />;", "return <ListaDatos items={datos} />;"]
    }
  }, {
    group: "3",
    title: "Seguimiento de Código: Evaluación de Estado Vacío",
    description: "Predice qué elemento se renderiza cuando la lista de elementos está vacía.",
    isCodeTracing: true,
    question: {
      questionText: "Predice qué se mostrará cuando items = []:",
      code: "function Lista({ items }) {\n  if (items.length === 0) {\n    return <p>No se encontraron elementos.</p>;\n  }\n  return <ul>{items.map(i => <li key={i}>{i}</li>)}</ul>;\n}",
      options: ["<p>No se encontraron elementos.</p>", "<ul></ul>", "null", "Error: Cannot read empty array"],
      answer: "<p>No se encontraron elementos.</p>"
    }
  }, {
    group: "3",
    title: "Mejor Implementación: Cambio Declarativo de Pestañas",
    description: "Selecciona la implementación más declarativa para alternar vistas.",
    isBestImplementation: true,
    showPreview: true,
    question: {
      questionText: "¿Qué implementación de pestañas renderiza limpiamente las vistas según el estado activo?",
      previewCode: "function TabSwitcherPreview() {\n  const [pestana, setPestana] = React.useState('actividad');\n  const pestanas = { actividad: ['Flujo de Actividad', 'Actividad del portafolio y commits'], perfil: ['Perfil Dev', '3 proyectos \xB7 12 habilidades logradas'] };\n  return (\n    <div style={{ padding: '6px 4px', fontFamily: 'system-ui, sans-serif' }}>\n      <nav style={{ display: 'flex', gap: 6, marginBottom: 6 }}>\n        {Object.keys(pestanas).map(nombre => (\n          <button key={nombre} onClick={() => setPestana(nombre)} style={{ flex: 1, border: 0, borderRadius: 6, padding: '5px 8px', cursor: 'pointer', textTransform: 'capitalize', background: pestana === nombre ? '#ec4899' : '#e2e8f0', color: pestana === nombre ? 'white' : '#334155', fontWeight: 700, fontSize: 11.5 }}>{nombre}</button>\n        ))}\n      </nav>\n      <div style={{ padding: '6px 10px', background: '#f8fafc', borderRadius: 7, border: '1px solid #e2e8f0' }}>\n        <strong style={{ color: '#0f172a', fontSize: 12 }}>{pestanas[pestana][0]}</strong>\n        <p style={{ margin: 0, color: '#64748b', fontSize: 11 }}>{pestanas[pestana][1]}</p>\n      </div>\n    </div>\n  );\n}",
      options: ["<div>\n  <nav>\n    <button onClick={() => setTab('feed')}>Publicaciones</button>\n    <button onClick={() => setTab('profile')}>Perfil</button>\n  </nav>\n  {tab === 'feed' ? <FeedView /> : <ProfileView />}\n</div>", "<div>\n  <button onclick='tab=\"feed\"'>Feed</button>\n  <script>render()</script>\n</div>", "<div>\n  {setTab('feed')}\n  <FeedView />\n</div>", "<div>\n  <iframe src={tab} />\n</div>"],
      answer: "<div>\n  <nav>\n    <button onClick={() => setTab('feed')}>Publicaciones</button>\n    <button onClick={() => setTab('profile')}>Perfil</button>\n  </nav>\n  {tab === 'feed' ? <FeedView /> : <ProfileView />}\n</div>"
    }
  }, {
    group: "3",
    title: "Inicio de la Fase React: Componentes Funcionales",
    description: "Inicia la fase de React conectando funciones de JavaScript, props y JSX renderizado.",
    isMultipleChoice: true,
    question: {
      questionText: "¿Qué es un componente funcional de React en el desarrollo web moderno?",
      options: ["Una función JavaScript que acepta props y devuelve JSX describiendo lo que debe aparecer en pantalla.", "Un custom hook que solo devuelve estado y nunca puede devolver JSX.", "Un controlador de eventos que reemplaza directamente el DOM cada vez que cambia el estado.", "Una clase de JavaScript utilizada únicamente para almacenar datos y nunca renderizar una interfaz."],
      answer: "Una función JavaScript que acepta props y devuelve JSX describiendo lo que debe aparecer en pantalla."
    }
  }, {
    group: "3",
    title: "Respuesta Abierta: Virtual DOM y Reconciliaci\xF3n",
    description: "Explica c\xF3mo React optimiza el renderizado usando el Virtual DOM.",
    isText: true,
    question: {
      questionText: "Explica c\xF3mo el algoritmo de reconciliaci\xF3n y el Virtual DOM de React optimizan los cambios en el DOM real. \xBFPor qu\xE9 es m\xE1s eficiente?"
    }
  }, {
    group: "3",
    title: "Seguimiento de Código: Re-renderizado de Componentes",
    description: "Rastrea la reejecución de un componente cuando se actualiza el estado.",
    isCodeTracing: true,
    question: {
      questionText: "En una compilación de producción sin un contenedor StrictMode, ¿cuántas veces se imprimirá 'Render App' si el botón se presiona dos veces?",
      code: "function App() {\n  const [count, setCount] = React.useState(0);\n  console.log('Render App');\n  return <button onClick={() => setCount(c => c + 1)}>Click {count}</button>;\n}",
      options: ["3 veces (1 renderizado inicial de montaje + 2 re-renderizados por clic)", "2 veces (solo los clics re-renderizan)", "1 vez (los componentes se ejecutan una sola vez)", "0 veces (las funciones no ejecutan registros de consola)"],
      answer: "3 veces (1 renderizado inicial de montaje + 2 re-renderizados por clic)"
    }
  }, {
    group: "3",
    title: "Corrigiendo Mutación Directa de Estado en Controlador",
    description: "Corrige el controlador para actualizar el contador de forma inmutable usando setCount.",
    isFixBug: true,
    question: {
      questionText: "Corrige el controlador para llamar a setCount en lugar de reasignar count directamente:",
      starterCode: "function Contador() {\n  let [count, setCount] = useState(0);\n  const handleIncrement = () => {\n    count = count + 1;\n  };\n  return <button onClick={handleIncrement}>{count}</button>;\n}",
      answer: "function Contador() {\n  const [count, setCount] = useState(0);\n  const handleIncrement = () => {\n    setCount(c => c + 1);\n  };\n  return <button onClick={handleIncrement}>{count}</button>;\n}",
      tests: ["Utiliza setCount(c => c + 1) o setCount(count + 1)", "Provoca el re-renderizado del componente al hacer clic"]
    }
  }, {
    group: "3",
    title: "Eventos Sintéticos en React",
    description: "Comprende cómo React envuelve eventos nativos en SyntheticEvents compatibles.",
    isMultipleChoice: true,
    question: {
      questionText: "¿Por qué React envuelve los eventos del DOM nativo en SyntheticEvents?",
      options: ["Para proporcionar un comportamiento y propiedades coherentes en todos los navegadores web.", "Para evitar que se disparen eventos de teclado en el navegador.", "Para enviar automáticamente cada clic a una base de datos remota.", "Para convertir todos los clics izquierdos en clics derechos."],
      answer: "Para proporcionar un comportamiento y propiedades coherentes en todos los navegadores web."
    }
  }, {
    group: "3",
    title: "Respuesta Corta: Hook de Estado en React",
    description: "Identifica el hook principal para manejo de estado en componentes funcionales.",
    isSingleLineText: true,
    question: {
      questionText: "\xBFCu\xE1l es el nombre del hook est\xE1ndar de React utilizado para declarar y actualizar variables de estado local en componentes funcionales?",
      answer: "useState"
    }
  }, {
    group: "3",
    title: "Respuesta Abierta: Props vs Estado en React",
    description: "Explica la diferencia entre props y estado en la arquitectura de componentes.",
    isText: true,
    question: {
      questionText: "Explica las diferencias fundamentales entre props y state en React. \xBFC\xF3mo fluyen los datos entre componentes padre e hijo?"
    }
  }, {
    group: "3",
    title: "Identificando Claves Faltantes en Listas",
    description: "Localiza el elemento mapeado que carece de la propiedad única key.",
    isRelevantLine: true,
    question: {
      questionText: "Selecciona la línea donde el elemento mapeado carece de la propiedad única key:",
      code: "function ListaUsuarios({ usuarios }) {\n  return (\n    <ul>\n      {usuarios.map(u => (\n        <li>{u.nombre} - {u.correo}</li>\n      ))}\n    </ul>\n  );\n}",
      answer: 5
    }
  }, {
    group: "3",
    title: "Seguimiento de Código: Props Hacia Abajo, Eventos Hacia Arriba",
    description: "Rastrea el flujo de datos desde el estado del padre hacia un componente hijo.",
    isCodeTracing: true,
    question: {
      questionText: "Predice qué texto se mostrará en el botón hijo tras hacer clic una vez:",
      code: "function Padre() {\n  const [val, setVal] = React.useState(10);\n  return <Hijo actual={val} onSumar={() => setVal(v => v + 5)} />;\n}\nfunction Hijo({ actual, onSumar }) {\n  return <button onClick={onSumar}>Total: {actual}</button>;\n}",
      options: ["Total: 15", "Total: 10", "Total: 5", "Total: undefined"],
      answer: "Total: 15"
    }
  }, {
    group: "3",
    title: "Práctica de Terminal: Listar Archivos",
    description: "Lista el contenido del directorio en un terminal Bash.",
    isCode: true,
    isTerminal: true,
    question: {
      questionText: "En un entorno de terminal Bash, ingresa el comando para listar los archivos del directorio actual"
    }
  }, {
    group: "3",
    title: "Paradigmas de Estilo en React",
    description: "Relaciona las técnicas de estilo en React con su sintaxis.",
    isMatchPairs: true,
    question: {
      questionText: "Relaciona cada técnica de estilo con su sintaxis de implementación:",
      pairs: [{
        left: "Objeto de Estilo en Línea",
        right: 'style={{ backgroundColor: "#3b82f6", padding: 12 }}'
      }, {
        left: "Módulos CSS",
        right: 'import styles from "./Boton.module.css"; className={styles.btn}'
      }, {
        left: "Tailwind / CSS Utilitario",
        right: 'className="bg-blue-500 p-3 rounded-lg text-white"'
      }, {
        left: "CSS Global Vainilla",
        right: 'className="boton-personalizado" con hoja de estilos global'
      }],
      choices: ['style={{ backgroundColor: "#3b82f6", padding: 12 }}', 'import styles from "./Boton.module.css"; className={styles.btn}', 'className="bg-blue-500 p-3 rounded-lg text-white"', 'className="boton-personalizado" con hoja de estilos global'],
      answer: {
        "Objeto de Estilo en Línea": 'style={{ backgroundColor: "#3b82f6", padding: 12 }}',
        "Módulos CSS": 'import styles from "./Boton.module.css"; className={styles.btn}',
        "Tailwind / CSS Utilitario": 'className="bg-blue-500 p-3 rounded-lg text-white"',
        "CSS Global Vainilla": 'className="boton-personalizado" con hoja de estilos global'
      }
    }
  }, {
    showPreview: true,
    group: "3",
    title: "Construyendo Diseños con Flexbox",
    description: "Ordena las reglas de CSS para centrar vertical y horizontalmente el contenido de una tarjeta.",
    isSelectOrder: true,
    question: {
      previewCode: "function LaboratorioTarjetasFlexbox() {\n  const [alineacion, setAlineacion] = React.useState('space-between');\n  return (\n    <div style={{ padding: '6px 4px', fontFamily: 'system-ui, sans-serif' }}>\n      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>\n        <span style={{ fontSize: 11, fontWeight: 700, color: '#334155' }}>justify-content:</span>\n        <div style={{ display: 'flex', gap: 4 }}>\n          {['space-between', 'center', 'flex-start'].map(j => (\n            <button key={j} onClick={() => setAlineacion(j)} style={{ border: 0, borderRadius: 5, padding: '3px 6px', fontSize: 10, cursor: 'pointer', background: alineacion === j ? '#ec4899' : '#e2e8f0', color: alineacion === j ? 'white' : '#334155', fontWeight: 600 }}>{j}</button>\n          ))}\n        </div>\n      </div>\n      <div style={{ display: 'flex', justifyContent: alineacion, gap: 6, background: '#0f172a', padding: '8px', borderRadius: 8 }}>\n        <div style={{ background: '#ec4899', color: 'white', padding: '6px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>Tarjeta A</div>\n        <div style={{ background: '#38bdf8', color: '#0f172a', padding: '6px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>Tarjeta B</div>\n      </div>\n    </div>\n  );\n}",
      questionText: "Ordena las reglas de CSS para centrar el contenido de la tarjeta en una columna:",
      options: ["1. display: flex;", "2. flex-direction: column;", "3. align-items: center;", "4. justify-content: center;"],
      answer: ["1. display: flex;", "2. flex-direction: column;", "3. align-items: center;", "4. justify-content: center;"]
    }
  }, {
    group: "3",
    title: "Elevando Estado al Ancestro Común",
    description: "Eleva el estado del hijo al padre para que múltiples componentes compartan datos.",
    isRefactoringChallenge: true,
    question: {
      questionText: "Refactoriza el estado dentro de InputBusqueda hacia el componente padre PaginaBusqueda:",
      starterCode: "function PaginaBusqueda() {\n  return (\n    <div>\n      <InputBusqueda />\n      <ResultadosBusqueda />\n    </div>\n  );\n}\n\nfunction InputBusqueda() {\n  const [consulta, setConsulta] = useState('');\n  return (\n    <input\n      value={consulta}\n      onChange={(e) => setConsulta(e.target.value)}\n    />\n  );\n}",
      answer: "function PaginaBusqueda() {\n  const [consulta, setConsulta] = useState('');\n  return (\n    <div>\n      <InputBusqueda\n        consulta={consulta}\n        setConsulta={setConsulta}\n      />\n      <ResultadosBusqueda consulta={consulta} />\n    </div>\n  );\n}\n\nfunction InputBusqueda({ consulta, setConsulta }) {\n  return (\n    <input\n      value={consulta}\n      onChange={(e) => setConsulta(e.target.value)}\n    />\n  );\n}",
      tests: ["Define const [consulta, setConsulta] en PaginaBusqueda", "Pasa la consulta a ResultadosBusqueda"]
    }
  }, {
    group: "3",
    title: "Respuesta Abierta: Efectos Secundarios y useEffect",
    description: "Explica qu\xE9 es un efecto secundario y por qu\xE9 se requiere useEffect.",
    isText: true,
    question: {
      questionText: "\xBFQu\xE9 es un efecto secundario en React y por qu\xE9 operaciones como peticiones a APIs, suscripciones o temporizadores deben ir dentro de useEffect?"
    }
  }, {
    group: "3",
    title: "Ciclo de Vida de Componentes en React",
    description: "Ordena las fases cronológicas desde el montaje inicial hasta el desmontaje.",
    isSelectOrder: true,
    question: {
      questionText: "Ordena cronológicamente las fases del ciclo de vida de un componente en React:",
      options: ["1. Renderizado inicial del componente (Montaje)", "2. Ejecución de funciones de configuración en useEffect", "3. Actualización de estado o prop provoca re-renderizado", "4. El componente se desmonta y ejecuta la limpieza de useEffect"],
      answer: ["1. Renderizado inicial del componente (Montaje)", "2. Ejecución de funciones de configuración en useEffect", "3. Actualización de estado o prop provoca re-renderizado", "4. El componente se desmonta y ejecuta la limpieza de useEffect"]
    }
  }, {
    group: "3",
    title: "Secuencia de Obtención de Datos en useEffect",
    description: "Ordena las etapas para obtener datos de forma asíncrona y gestionar estados de carga.",
    isSelectOrder: true,
    question: {
      questionText: "Ordena los pasos para obtener datos de forma segura en useEffect:",
      options: ["1. Establecer el estado de carga en verdadero", "2. Ejecutar await fetch(endpoint)", "3. Parsear el JSON de respuesta y actualizar el estado de datos", "4. Capturar posibles errores y establecer la carga en falso"],
      answer: ["1. Establecer el estado de carga en verdadero", "2. Ejecutar await fetch(endpoint)", "3. Parsear el JSON de respuesta y actualizar el estado de datos", "4. Capturar posibles errores y establecer la carga en falso"]
    }
  }, {
    group: "3",
    title: "Mejor Implementación: Inserciones Inmutables en Arreglos",
    description: "Selecciona la actualización de estado que añade un nuevo elemento sin mutar.",
    isBestImplementation: true,
    question: {
      questionText: "¿Qué implementación de setter añade correctamente una publicación al inicio del feed?",
      options: ["setPosts((prev) => [\n  newPost,\n  ...prev\n]);", "posts.unshift(newPost);\nsetPosts(posts);", "setPosts(posts + newPost);", "setPosts(newPost);"],
      answer: "setPosts((prev) => [\n  newPost,\n  ...prev\n]);"
    }
  }, {
    group: "3",
    title: "Evitar Estado Obsoleto en Actualizaciones en Cola",
    description: "Elige la forma confiable de actualizar estado cuando el siguiente valor depende del anterior.",
    isMultipleChoice: true,
    question: {
      questionText: "¿Por qué setCount((actual) => actual + 1) es más seguro que setCount(count + 1) cuando pueden acumularse varias actualizaciones?",
      options: ["React entrega a cada actualizador el estado más reciente de la cola y evita calcular desde un valor obsoleto.", "El actualizador modifica count directamente sin renderizar.", "Los setters de React solo aceptan funciones y nunca valores.", "El actualizador impide que el componente vuelva a renderizarse."],
      answer: "React entrega a cada actualizador el estado más reciente de la cola y evita calcular desde un valor obsoleto."
    }
  }, {
    group: "3",
    title: "Refactorizando Estado a Custom Hooks",
    description: "Extrae la lógica de obtención de datos a un hook personalizado useFetch.",
    isRefactoringChallenge: true,
    question: {
      questionText: "Extrae la lógica de obtención de datos a un custom hook useFetch reutilizable:",
      starterCode: "function Perfil({ url }) {\n  const [data, setData] = useState(null);\n  useEffect(() => {\n    fetch(url)\n      .then((r) => r.json())\n      .then(setData);\n  }, [url]);\n  return <div>{data?.nombre}</div>;\n}",
      answer: "function useFetch(url) {\n  const [data, setData] = useState(null);\n  useEffect(() => {\n    fetch(url)\n      .then((r) => r.json())\n      .then(setData);\n  }, [url]);\n  return data;\n}",
      tests: ["Define la función useFetch(url)", "Devuelve el estado de datos obtenidos"]
    }
  }, {
    group: "3",
    title: "Configuraci\xF3n del Arreglo de Dependencias en useEffect",
    description: "Completa el arreglo de dependencias para evitar ciclos infinitos de re-renderizado.",
    isFillCodeBlanks: true,
    question: {
      questionText: "Completa el arreglo de dependencias vac\xEDo para asegurar que el efecto se ejecute solo una vez al montar el componente:",
      template: "useEffect(() => {\n  obtenerDatos();\n}, {{[]}});",
      blanks: [{
        key: "[]",
        hint: "Un arreglo de dependencias vacío"
      }],
      answer: {
        "[]": "[]"
      }
    }
  }, {
    group: "3",
    title: "Reglas de la Propiedad Key en Listas",
    description: "Selecciona todos los criterios válidos para el uso de la propiedad key en React.",
    isMultipleAnswerChoice: true,
    question: {
      questionText: "Selecciona todas las afirmaciones verdaderas sobre la propiedad key en listas de React:",
      options: ["Las keys permiten a React identificar qué elementos han cambiado, agregado o eliminado", "Las keys deben ser identificadores únicos y estables (p. ej. item.id) en lugar de índices", "Usar Math.random() como key fuerza el re-montaje innecesario de elementos en cada render", "Las keys se pasan automáticamente a componentes hijos como props regulares accesibles por props.key", "Las keys solo se requieren si la lista supera los 1000 elementos"],
      answer: ["Las keys permiten a React identificar qué elementos han cambiado, agregado o eliminado", "Las keys deben ser identificadores únicos y estables (p. ej. item.id) en lugar de índices", "Usar Math.random() como key fuerza el re-montaje innecesario de elementos en cada render"]
    }
  }, {
    group: "3",
    title: "Elevando Estado con Controladores Callback",
    description: "Ordena las líneas para pasar un callback desde el padre al hijo para actualizar el estado.",
    isParsonsProblem: true,
    question: {
      questionText: "Ordena las líneas de un componente padre que gestiona el cambio de estado de un elemento hijo:",
      lines: ["function AppTareas() {", "  const [tareas, setTareas] = useState([]);", "  const toggle = (id) => {", "    setTareas(t => update(t, id));", "  };", "  return <ListaTareas items={tareas} onToggle={toggle} />;", "}"],
      answer: ["function AppTareas() {", "  const [tareas, setTareas] = useState([]);", "  const toggle = (id) => {", "    setTareas(t => update(t, id));", "  };", "  return <ListaTareas items={tareas} onToggle={toggle} />;", "}"]
    }
  }, {
    group: "3",
    title: "Previniendo Bucles Infinitos de Renderizado en useEffect",
    description: "Localiza la falta de arreglo de dependencias que desencadena un bucle infinito.",
    isRelevantLine: true,
    question: {
      questionText: "Selecciona la línea donde la falta del arreglo de dependencias causa que el efecto se ejecute en cada re-render:",
      code: "function Contador() {\n  const [count, setCount] = useState(0);\n  useEffect(() => {\n    setCount(c => c + 1);\n  });\n  return <div>{count}</div>;\n}",
      answer: 5
    }
  }, {
    group: "3",
    title: "Respuesta Corta: Convenci\xF3n de Nombre para Hooks Personalizados",
    description: "Identifica el prefijo obligatorio para hooks personalizados en React.",
    isSingleLineText: true,
    question: {
      questionText: "\xBFCon qu\xE9 prefijo de dos letras debe comenzar el nombre de cualquier hook personalizado en React por convenci\xF3n (ej. useWindowSize)?",
      answer: "use"
    }
  }, {
    group: "3",
    title: "Seguimiento de Código: Estado Derivado vs Redundante",
    description: "Rastrea valores computados directamente durante el render sin llamadas adicionales a setState.",
    isCodeTracing: true,
    question: {
      questionText: "Predice qué se imprimirá para totalActivos durante el renderizado:",
      code: "const items = [\n  { id: 1, activo: true },\n  { id: 2, activo: false },\n  { id: 3, activo: true }\n];\nconst totalActivos = items.filter(i => i.activo).length;\nconsole.log(totalActivos);",
      options: ["2", "3", "1", "undefined"],
      answer: "2"
    }
  }, {
    showPreview: true,
    group: "3",
    title: "Composición de Componentes con props.children",
    description: "Envuelve componentes JSX arbitrarios dentro de un diseño Modal reutilizable.",
    isCodeCompletion: true,
    question: {
      previewCode: "function VistaPreviaComposicionModal() {\n  const [tipoHijo, setTipoHijo] = React.useState('usuario');\n  const titulo = tipoHijo === 'usuario' ? 'Perfil de Usuario' : 'Confirmar Orden';\n\n  return (\n    <div style={{ padding: '4px 2px', fontFamily: 'system-ui, sans-serif' }}>\n      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>\n        <span style={{ fontSize: 10.5, color: '#475569', fontWeight: 700 }}>Pasar JSX a &lt;Modal&gt;&#123;children&#125;&lt;/Modal&gt;:</span>\n        <div style={{ display: 'flex', gap: 4 }}>\n          <button onClick={() => setTipoHijo('usuario')} style={{ border: 0, borderRadius: 5, padding: '2px 8px', fontSize: 10.5, cursor: 'pointer', background: tipoHijo === 'usuario' ? '#ec4899' : '#e2e8f0', color: tipoHijo === 'usuario' ? 'white' : '#334155', fontWeight: 600 }}>&lt;PerfilUsuario /&gt;</button>\n          <button onClick={() => setTipoHijo('orden')} style={{ border: 0, borderRadius: 5, padding: '2px 8px', fontSize: 10.5, cursor: 'pointer', background: tipoHijo === 'orden' ? '#ec4899' : '#e2e8f0', color: tipoHijo === 'orden' ? 'white' : '#334155', fontWeight: 600 }}>&lt;ResumenOrden /&gt;</button>\n        </div>\n      </div>\n      <div style={{ background: '#ffffff', border: '1.5px solid #cbd5e1', borderRadius: 8, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>\n        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a', color: 'white', padding: '5px 10px' }}>\n          <h2 style={{ margin: 0, fontSize: 12, fontWeight: 700 }}>{titulo}</h2>\n          <span style={{ fontSize: 11, color: '#94a3b8' }}>\u2715</span>\n        </div>\n        <div style={{ padding: '8px 10px', background: '#f8fafc' }}>\n          <div style={{ fontSize: 9.5, color: '#64748b', marginBottom: 4, fontWeight: 600 }}>Contenedor de cuerpo &#123;children&#125;:</div>\n          {tipoHijo === 'usuario' ? (\n            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'white', border: '1px solid #e2e8f0', padding: '6px 8px', borderRadius: 6 }}>\n              <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#ec4899', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>A</div>\n              <div>\n                <div style={{ fontSize: 11.5, fontWeight: 700, color: '#0f172a' }}>Alex Rivera</div>\n                <div style={{ fontSize: 10, color: '#64748b' }}>alex@sunset.io \u2022 Admin</div>\n              </div>\n            </div>\n          ) : (\n            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '6px 8px', borderRadius: 6 }}>\n              <span style={{ fontSize: 11, color: '#166534', fontWeight: 600 }}>\uD83D\uDCB3 Suscripci\xF3n Plan Pro</span>\n              <span style={{ fontSize: 11.5, fontWeight: 700, color: '#15803d' }}>$19.00 / mes</span>\n            </div>\n          )}\n        </div>\n      </div>\n    </div>\n  );\n}",
      questionText: "¿Qué componente modal renderiza limpiamente contenido hijo dentro de su contenedor?",
      options: ['function Modal({ title, children }) {\n  return (\n    <div className="modal-backdrop">\n      <h2>{title}</h2>\n      <div className="modal-body">\n        {children}\n      </div>\n    </div>\n  );\n}', "function Modal({ title }) {\n  return <h2>{title}</h2>;\n}", "function Modal(children) {\n  return (\n    <div>\n      {children()}\n    </div>\n  );\n}", "const Modal = (content) => (\n  <div body={content} />\n);"],
      answer: 'function Modal({ title, children }) {\n  return (\n    <div className="modal-backdrop">\n      <h2>{title}</h2>\n      <div className="modal-body">\n        {children}\n      </div>\n    </div>\n  );\n}'
    }
  }, {
    group: "3",
    title: "Cancelar una Solicitud al Desmontar el Componente",
    description: "Usa AbortController para detener una solicitud en curso durante la limpieza del efecto.",
    isFixBug: true,
    question: {
      questionText: "Corrige el efecto para cancelar la solicitud fetch si el componente se desmonta antes de recibir la respuesta:",
      starterCode: "useEffect(() => {\n  fetch('/api/perfil')\n    .then((respuesta) => respuesta.json())\n    .then(setDatos);\n}, []);",
      answer: "useEffect(() => {\n  const controller = new AbortController();\n  fetch('/api/perfil', { signal: controller.signal })\n    .then((respuesta) => respuesta.json())\n    .then(setDatos)\n    .catch((error) => {\n      if (error.name !== 'AbortError') throw error;\n    });\n  return () => controller.abort();\n}, []);",
      tests: ["Crea un AbortController", "Pasa controller.signal a fetch", "Llama controller.abort durante la limpieza"]
    }
  }, {
    group: "3",
    title: "Escritura de C\xF3digo: Filtrado y Transformaci\xF3n de Datos",
    description: "Escribe una funci\xF3n que filtre usuarios activos y obtenga sus nombres.",
    isCode: true,
    question: {
      questionText: "Escribe una funci\xF3n obtenerNombresActivos(usuarios) que filtre los usuarios donde isActive sea true y devuelva un arreglo con sus nombres:",
      starterCode: "function obtenerNombresActivos(usuarios) {\n  // Filtra usuarios activos y después devuelve sus nombres.\n}",
      answer: "function obtenerNombresActivos(usuarios) {\n  return usuarios\n    .filter((u) => u.isActive)\n    .map((u) => u.nombre || u.name);\n}",
      tests: ["Filtra los usuarios inactivos", "Devuelve un arreglo con los nombres"]
    }
  }, {
    group: "3",
    title: "Temporizadores de Intervalo y Limpieza en useEffect",
    description: "Comprende cómo devolver una función de limpieza desde useEffect para cancelar temporizadores y evitar fugas de memoria.",
    showPreview: true,
    isCodeCompletion: true,
    question: {
      questionText: "¿Qué implementación de useEffect inicia correctamente un temporizador de intervalo y lo limpia en la función de retorno?",
      previewCode: "function TimerWidget() {\n  const [segundos, setSegundos] = React.useState(0);\n  const [estaActivo, setEstaActivo] = React.useState(true);\n\n  React.useEffect(() => {\n    if (!estaActivo) return;\n    const intervalo = setInterval(() => {\n      setSegundos(s => s + 1);\n    }, 1000);\n    return () => clearInterval(intervalo);\n  }, [estaActivo]);\n\n  return (\n    <div style={{ padding: '8px 12px', textAlign: 'center', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>\n      <div style={{ textAlign: 'left' }}>\n        <span style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>{segundos}s</span>\n        <p style={{ margin: 0, color: '#64748b', fontSize: 11 }}>Limpieza al desmontar</p>\n      </div>\n      <button\n        onClick={() => setEstaActivo(!estaActivo)}\n        style={{ padding: '6px 14px', background: estaActivo ? '#ef4444' : '#10b981', color: 'white', border: 'none', borderRadius: 7, cursor: 'pointer', fontWeight: 700, fontSize: 12, flexShrink: 0 }}\n      >\n        {estaActivo ? 'Pausar' : 'Reanudar'}\n      </button>\n    </div>\n  );\n}",
      options: ["useEffect(() => {\n  const timer = setInterval(() => {\n    setSegundos(s => s + 1);\n  }, 1000);\n  return () => clearInterval(timer);\n}, []);", "useEffect(() => {\n  setInterval(() => {\n    setSegundos(s => s + 1);\n  }, 1000);\n}, []);", "useEffect(() => {\n  const timer = setInterval(() => {\n    setSegundos(s => s + 1);\n  }, 1000);\n  clearInterval(timer);\n}, []);", "useEffect(() => {\n  return setInterval(() => {\n    setSegundos(s => s + 1);\n  }, 1000);\n}, []);"],
      answer: "useEffect(() => {\n  const timer = setInterval(() => {\n    setSegundos(s => s + 1);\n  }, 1000);\n  return () => clearInterval(timer);\n}, []);"
    }
  }, {
    group: "3",
    title: "Construye tu Aplicación",
    isConversationReview: true,
    description: "Observa cómo tu app evoluciona de HTML semántico y CSS responsivo a una interfaz interactiva en React.",
    question: {
      questionText: "Tu app ya tiene una interfaz responsiva e interactiva. ¡Celebremos lo que cambió!",
      range: [58, 106]
    }
  }, {
    showPreview: true,
    group: "4",
    title: "Métodos HTTP y Acciones REST",
    description: "Relaciona los verbos HTTP principales con las operaciones CRUD de base de datos.",
    isMatchPairs: true,
    question: {
      previewCode: "function ClienteMetodosApiRest() {\n  const [metodo, setMetodo] = React.useState('GET');\n  const respuestas = {\n    GET: { estado: '200 OK', cuerpo: '[{ id: 1, nombre: \"Proyecto Alfa\" }]' },\n    POST: { estado: '201 Created', cuerpo: '{ exito: true, id: 2 }' },\n    DELETE: { estado: '204 No Content', cuerpo: '(Recurso eliminado)' }\n  };\n  return (\n    <div style={{ padding: '6px 4px', fontFamily: 'system-ui, sans-serif' }}>\n      <div style={{ display: 'flex', gap: 5, marginBottom: 6 }}>\n        {['GET', 'POST', 'DELETE'].map(m => (\n          <button key={m} onClick={() => setMetodo(m)} style={{ flex: 1, border: 0, borderRadius: 5, padding: '4px', fontSize: 11, fontWeight: 700, cursor: 'pointer', background: metodo === m ? '#0f172a' : '#e2e8f0', color: metodo === m ? '#38bdf8' : '#334155' }}>{m} /api/proyectos</button>\n        ))}\n      </div>\n      <div style={{ background: '#0f172a', color: '#f8fafc', padding: '6px 10px', borderRadius: 7, fontFamily: 'monospace', fontSize: 11, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>\n        <span>{respuestas[metodo].cuerpo}</span>\n        <span style={{ color: '#10b981', fontWeight: 700 }}>{respuestas[metodo].estado}</span>\n      </div>\n    </div>\n  );\n}",
      questionText: "Relaciona cada método de solicitud HTTP con su función principal en la API:",
      pairs: [{
        left: "GET",
        right: "Recuperar datos o leer recursos desde el servidor"
      }, {
        left: "POST",
        right: "Crear un nuevo recurso con un cuerpo de solicitud"
      }, {
        left: "PUT / PATCH",
        right: "Actualizar o modificar un recurso existente"
      }, {
        left: "DELETE",
        right: "Eliminar un recurso especificado de la base de datos"
      }],
      choices: ["Recuperar datos o leer recursos desde el servidor", "Crear un nuevo recurso con un cuerpo de solicitud", "Actualizar o modificar un recurso existente", "Eliminar un recurso especificado de la base de datos"],
      answer: {
        GET: "Recuperar datos o leer recursos desde el servidor",
        POST: "Crear un nuevo recurso con un cuerpo de solicitud",
        "PUT / PATCH": "Actualizar o modificar un recurso existente",
        DELETE: "Eliminar un recurso especificado de la base de datos"
      }
    }
  }, {
    group: "4",
    title: "Respuesta Corta: C\xF3digo de Estado HTTP No Encontrado",
    description: "Identifica el c\xF3digo de estado HTTP est\xE1ndar para recursos no encontrados.",
    isSingleLineText: true,
    question: {
      questionText: "\xBFQu\xE9 c\xF3digo de estado HTTP de 3 d\xEDgitos indica que el recurso o endpoint solicitado no fue encontrado en el servidor?",
      answer: "404"
    }
  }, {
    group: "4",
    title: "JavaScript Asíncrono y el Event Loop",
    description: "Comprende la E/S sin bloqueo y cómo se resuelven las promesas en JavaScript.",
    isMultipleChoice: true,
    question: {
      questionText: "¿Por qué Node.js utiliza E/S asíncrona y sin bloqueo para operaciones de red y base de datos?",
      options: ["Permite que JavaScript continúe trabajando mientras el entorno espera la E/S y después encola el callback o la continuación de la promesa.", "Hace que todas las operaciones de base de datos terminen al mismo tiempo y en cualquier orden.", "Garantiza que las solicitudes de red nunca fallen ni agoten su tiempo.", "Mueve cada función de JavaScript a su propio proceso del sistema operativo."],
      answer: "Permite que JavaScript continúe trabajando mientras el entorno espera la E/S y después encola el callback o la continuación de la promesa."
    }
  }, {
    group: "4",
    title: "Consumo de Promesas con Async / Await",
    description: "Ordena las líneas para obtener y parsear datos JSON de un endpoint de forma asíncrona.",
    isParsonsProblem: true,
    question: {
      questionText: "Ordena las líneas en una función completa de obtención de datos asíncrona:",
      lines: ["async function getUsuario(id) {", "  const res = await fetch(`/usuarios/${id}`);", "  if (!res.ok) throw new Error('Error');", "  const data = await res.json();", "  return data;", "}"],
      answer: ["async function getUsuario(id) {", "  const res = await fetch(`/usuarios/${id}`);", "  if (!res.ok) throw new Error('Error');", "  const data = await res.json();", "  return data;", "}"]
    }
  }, {
    group: "4",
    title: "Escritura de C\xF3digo: Ruta API de Verificaci\xF3n de Estado",
    description: "Escribe una ruta GET en Express que responda con JSON de estado.",
    isCode: true,
    question: {
      questionText: "Escribe una funci\xF3n registrarRutaSalud(app) que registre una ruta GET en '/api/health' respondiendo con status 200 y JSON { status: 'healthy' }:",
      starterCode: "function registrarRutaSalud(app) {\n  // Registra GET /api/health y devuelve la respuesta solicitada.\n}",
      answer: "function registrarRutaSalud(app) {\n  app.get('/api/health', (req, res) => {\n    res.status(200).json({\n      status: 'healthy'\n    });\n  });\n}",
      tests: ["Registra GET /api/health", "Responde con status 200 y JSON correcto"]
    }
  }, {
    group: "4",
    title: "Manejo del Cuerpo de Solicitudes y Cargas JSON",
    description: "Extrae los datos entrantes y responde con el estado 201 Created.",
    isFillCodeBlanks: true,
    question: {
      questionText: "Completa el controlador POST para parsear req.body y responder con estado 201:",
      template: 'app.post("/api/usuarios", (req, res) => {\n  const datos = req.{{body}};\n  res.status({{201}}).json({\n    exito: true,\n    usuario: datos\n  });\n});',
      blanks: [{
        key: "body",
        label: "Propiedad del cuerpo de solicitud",
        hint: "body"
      }, {
        key: "201",
        label: "Código de estado Creado",
        hint: "201"
      }],
      answer: {
        body: "body",
        201: "201"
      }
    }
  }, {
    group: "4",
    title: "Corrigiendo Promesa No Esperada en Ruta Asíncrona",
    description: "Agrega el await faltante para no enviar promesas sin resolver en la respuesta.",
    isFixBug: true,
    question: {
      questionText: "Corrige el controlador asíncrono para esperar la consulta antes de enviar la respuesta JSON:",
      starterCode: "app.get('/api/usuarios', async (req, res) => {\n  const usuarios = db.getUsuarios();\n  res.json(usuarios);\n});",
      answer: "app.get('/api/usuarios', async (req, res) => {\n  const usuarios = await db.getUsuarios();\n  res.json(usuarios);\n});",
      tests: ["Espera a db.getUsuarios() antes de responder", "Envía los registros resueltos de usuarios"]
    }
  }, {
    group: "4",
    title: "Refactorizando Callbacks Anidados a Async/Await",
    description: "Refactoriza callbacks a una función asíncrona moderna con async/await.",
    isRefactoringChallenge: true,
    question: {
      questionText: "Refactoriza la consulta basada en callbacks a una función moderna con async/await:",
      starterCode: "function obtenerUsuario(id, callback) {\n  db.find(id, (err, usuario) => {\n    if (err) return callback(err);\n    callback(null, usuario);\n  });\n}",
      answer: "async function obtenerUsuario(id) {\n  const usuario = await db.find(id);\n  return usuario;\n}",
      tests: ["Utiliza la sintaxis async/await", "Devuelve directamente el objeto usuario resuelto"]
    }
  }, {
    group: "4",
    title: "Respuesta Abierta: Arquitectura SQL vs NoSQL",
    description: "Compara tablas relacionales y bases de datos documentales.",
    isText: true,
    question: {
      questionText: "Compara bases de datos relacionales (SQL) con bases de datos documentales (NoSQL) como Firestore. \xBFEn qu\xE9 escenarios es preferible un esquema NoSQL flexible?"
    }
  }, {
    showPreview: true,
    group: "4",
    title: "Mejor Implementación: Consultas Seguras a Base de Datos",
    description: "Selecciona la consulta parametrizada que previene inyecciones SQL.",
    isBestImplementation: true,
    question: {
      previewCode: "function SimuladorConsultasEnVivo() {\n  const [rol, setRol] = React.useState('admin');\n  const usuarios = [\n    { id: 1, nombre: 'Alicia Dev', rol: 'admin' },\n    { id: 2, nombre: 'Roberto Cloud', rol: 'member' },\n    { id: 3, nombre: 'Carla UI', rol: 'admin' }\n  ];\n  const resultados = usuarios.filter(u => u.rol === rol);\n\n  return (\n    <div style={{ padding: '6px 8px', fontFamily: 'system-ui, sans-serif' }}>\n      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>\n        <span style={{ fontSize: 11.5, fontWeight: 700, color: '#334155' }}>Consulta Parametrizada por Rol:</span>\n        <div style={{ display: 'flex', gap: 4 }}>\n          {['admin', 'member'].map(r => (\n            <button key={r} onClick={() => setRol(r)} style={{ border: 0, borderRadius: 5, padding: '3px 8px', background: rol === r ? '#ec4899' : '#e2e8f0', color: rol === r ? 'white' : '#334155', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>{r}</button>\n          ))}\n        </div>\n      </div>\n      <div style={{ padding: '5px 8px', background: '#0f172a', color: '#38bdf8', borderRadius: 6, fontFamily: 'monospace', fontSize: 11, display: 'flex', justifyContent: 'space-between' }}>\n        <span>WHERE rol = $1 [{rol}]</span>\n        <span style={{ color: '#10b981' }}>{resultados.length} encontrados</span>\n      </div>\n    </div>\n  );\n}",
      questionText: "¿Qué implementación utiliza parámetros seguros para prevenir ataques de inyección SQL?",
      options: ["const resultado = await db.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);", "const resultado = await db.query(`SELECT * FROM usuarios WHERE correo = '${correo}'`);", "const resultado = await db.query('SELECT * FROM usuarios WHERE correo = ' + correo);", "const resultado = await db.query(eval(`SELECT * FROM usuarios WHERE correo = ${correo}`));"],
      answer: "const resultado = await db.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);"
    }
  }, {
    group: "4",
    title: "Flujo de Autenticación con JSON Web Tokens (JWT)",
    description: "Ordena los pasos del ciclo de vida de autenticación basada en tokens.",
    isSelectOrder: true,
    question: {
      questionText: "Ordena los pasos cronológicos en un flujo de autenticación basado en tokens:",
      options: ["1. El cliente envía las credenciales a /auth/login", "2. El servidor valida las credenciales y firma un JWT", "3. El cliente almacena el token en memoria o almacenamiento seguro", "4. El cliente envía el token en el encabezado Authorization Bearer en las solicitudes API"],
      answer: ["1. El cliente envía las credenciales a /auth/login", "2. El servidor valida las credenciales y firma un JWT", "3. El cliente almacena el token en memoria o almacenamiento seguro", "4. El cliente envía el token en el encabezado Authorization Bearer en las solicitudes API"]
    }
  }, {
    showPreview: true,
    group: "4",
    title: "Modelado de Relaciones en Bases de Datos",
    description: "Identifica cómo se vinculan los registros padre e hijo en un modelo relacional.",
    isCodeCompletion: true,
    question: {
      previewCode: "function InspectorRelacionesBasesDatos() {\n  const [usuarioId, setUsuarioId] = React.useState(1);\n  const comentarios = [\n    { id: 101, user_id: 1, texto: '\xA1Excelente art\xEDculo sobre React!' },\n    { id: 102, user_id: 2, texto: 'Me encant\xF3 la secci\xF3n de bases de datos.' },\n    { id: 103, user_id: 1, texto: 'Consejos de arquitectura limpia.' }\n  ];\n  const comentariosUsuario = comentarios.filter(c => c.user_id === usuarioId);\n  return (\n    <div style={{ padding: '6px 4px', fontFamily: 'system-ui, sans-serif' }}>\n      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>\n        <span style={{ fontSize: 11, fontWeight: 700, color: '#334155' }}>Clave For\xE1nea (users.id = comments.user_id):</span>\n        <div style={{ display: 'flex', gap: 4 }}>\n          {[1, 2].map(id => (\n            <button key={id} onClick={() => setUsuarioId(id)} style={{ border: 0, borderRadius: 5, padding: '3px 8px', fontSize: 10.5, cursor: 'pointer', background: usuarioId === id ? '#ec4899' : '#e2e8f0', color: usuarioId === id ? 'white' : '#334155', fontWeight: 600 }}>Usuario #{id}</button>\n          ))}\n        </div>\n      </div>\n      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>\n        {comentariosUsuario.map(c => (\n          <div key={c.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '4px 8px', borderRadius: 6, fontSize: 11, display: 'flex', justifyContent: 'space-between', color: '#0f172a' }}>\n            <span>\uD83D\uDCAC \"{c.texto}\"</span>\n            <span style={{ fontFamily: 'monospace', color: '#ec4899', fontSize: 10 }}>user_id: {c.user_id}</span>\n          </div>\n        ))}\n      </div>\n    </div>\n  );\n}",
      questionText: "¿Qué esquema vincula correctamente la tabla 'comentarios' con un autor en la tabla 'usuarios'?",
      options: ["CREATE TABLE comentarios (\n  id SERIAL PRIMARY KEY,\n  texto TEXT,\n  usuario_id INT REFERENCES usuarios(id)\n);", "CREATE TABLE comentarios (\n  id SERIAL PRIMARY KEY,\n  texto TEXT,\n  nombre_usuario TEXT\n);", "CREATE TABLE comentarios (\n  usuarios JSON\n);", "CREATE TABLE comentarios (\n  link TABLE usuarios\n);"],
      answer: "CREATE TABLE comentarios (\n  id SERIAL PRIMARY KEY,\n  texto TEXT,\n  usuario_id INT REFERENCES usuarios(id)\n);"
    }
  }, {
    group: "4",
    title: "Corrigiendo Código de Estado en Respuesta de Error",
    description: "Corrige el código HTTP para devolver 404 cuando un usuario no existe.",
    isFixBug: true,
    question: {
      questionText: "Corrige el código de estado para devolver 404 cuando no se encuentre el usuario:",
      starterCode: "app.get('/api/usuarios/:id', async (req, res) => {\n  const usuario = await db.find(req.params.id);\n  if (!usuario) {\n    return res.status(200).json({\n      error: 'Usuario no encontrado'\n    });\n  }\n  res.json(usuario);\n});",
      answer: "app.get('/api/usuarios/:id', async (req, res) => {\n  const usuario = await db.find(req.params.id);\n  if (!usuario) {\n    return res.status(404).json({\n      error: 'Usuario no encontrado'\n    });\n  }\n  res.json(usuario);\n});",
      tests: ["Devuelve estado 404 cuando usuario es null", "Envía el mensaje de error correspondiente"]
    }
  }, {
    group: "4",
    title: "Variables de Entorno en la Firma de JWT",
    description: "Completa la referencia a la variable de entorno para firmar el token JWT.",
    isFillCodeBlanks: true,
    question: {
      questionText: "Completa la referencia a process.env para cargar la clave secreta din\xE1micamente sin dejarla en texto plano:",
      template: "function generarToken(usuario) {\n  return jwt.sign(\n    usuario,\n    {{process.env.JWT_SECRET}}\n  );\n}",
      blanks: [{
        key: "process.env.JWT_SECRET",
        hint: "Lee JWT_SECRET del entorno del servidor"
      }],
      answer: {
        "process.env.JWT_SECRET": "process.env.JWT_SECRET"
      }
    }
  }, {
    group: "4",
    title: "Mejor Implementación: Middleware de Autenticación",
    description: "Selecciona el middleware de verificación de tokens más robusto en Express.",
    isBestImplementation: true,
    question: {
      questionText: "¿Qué middleware valida correctamente los tokens Bearer del encabezado de autorización?",
      options: ["const authGuard = (req, res, next) => {\n  const token =\n    req.headers.authorization?.split(' ')[1];\n  if (!token) {\n    return res.status(401).json({\n      error: 'Unauthorized'\n    });\n  }\n  try {\n    req.user = jwt.verify(\n      token,\n      process.env.JWT_SECRET\n    );\n    next();\n  } catch (err) {\n    res.status(403).json({\n      error: 'Invalid token'\n    });\n  }\n};", "const authGuard = (req, res, next) => {\n  next();\n};", "const authGuard = (req, res, next) => {\n  if (req.url) next();\n};", "const authGuard = (req, res, next) => {\n  res.send(req.token);\n};"],
      answer: "const authGuard = (req, res, next) => {\n  const token =\n    req.headers.authorization?.split(' ')[1];\n  if (!token) {\n    return res.status(401).json({\n      error: 'Unauthorized'\n    });\n  }\n  try {\n    req.user = jwt.verify(\n      token,\n      process.env.JWT_SECRET\n    );\n    next();\n  } catch (err) {\n    res.status(403).json({\n      error: 'Invalid token'\n    });\n  }\n};"
    }
  }, {
    group: "4",
    title: "Canalización de Middleware en Express",
    description: "Ordena las líneas para configurar middleware y rutas en Express.",
    isParsonsProblem: true,
    question: {
      questionText: "Ordena las líneas para configurar el middleware express.json antes de la ruta de la API:",
      lines: ["const app = express();", "app.use(express.json());", 'app.get("/api/salud", (req, res) => {', '  res.json({ estado: "saludable" });', "});", "app.listen(3000);"],
      answer: ["const app = express();", "app.use(express.json());", 'app.get("/api/salud", (req, res) => {', '  res.json({ estado: "saludable" });', "});", "app.listen(3000);"]
    }
  }, {
    group: "4",
    title: "Seguridad de APIs y Limitación de Tasa",
    description: "Selecciona todas las medidas de seguridad críticas para servidores de producción.",
    isMultipleAnswerChoice: true,
    question: {
      questionText: "Selecciona todas las mejores prácticas de seguridad para servidores API:",
      options: ["Sanitizar y validar toda la entrada entrante del usuario", "Implementar limitación de tasa para prevenir ataques de fuerza bruta", "Almacenar contraseñas usando hashes criptográficos con sal (p. ej. bcrypt)", "Usar HTTPS / TLS para cifrar todo el tráfico en tránsito", "Exponer credenciales de base de datos directamente en paquetes del cliente", "Deshabilitar comprobaciones CORS para todos los dominios con comodín *"],
      answer: ["Sanitizar y validar toda la entrada entrante del usuario", "Implementar limitación de tasa para prevenir ataques de fuerza bruta", "Almacenar contraseñas usando hashes criptográficos con sal (p. ej. bcrypt)", "Usar HTTPS / TLS para cifrar todo el tráfico en tránsito"]
    }
  }, {
    group: "4",
    title: "Manejo de Errores en Rutas Asíncronas",
    description: "Identifica la línea donde el bloque catch intercepta errores de base de datos.",
    isRelevantLine: true,
    question: {
      questionText: "Selecciona la línea donde el bloque catch intercepta errores para evitar caídas del servidor:",
      code: "app.get('/api/usuarios', async (req, res) => {\n  try {\n    const usuarios = await db.query('SELECT * FROM usuarios');\n    res.json(usuarios);\n  } catch (error) {\n    res.status(500).json({ error: 'Error en la base de datos' });\n  }\n});",
      answer: 5
    }
  }, {
    group: "4",
    title: "Seguimiento de Código: Orden de Ejecución Asíncrona",
    description: "Rastrea microtareas asíncronas vs salidas síncronas en Node.js.",
    isCodeTracing: true,
    question: {
      questionText: "Predice el orden exacto de los mensajes registrados en consola al ejecutar este programa:",
      code: "console.log('1');\nsetTimeout(() => console.log('2'), 0);\nPromise.resolve().then(() => console.log('3'));\nconsole.log('4');",
      options: ["1, 4, 3, 2", "1, 2, 3, 4", "1, 3, 4, 2", "4, 3, 2, 1"],
      answer: "1, 4, 3, 2"
    }
  }, {
    group: "4",
    title: "Práctica de Terminal: Pruebas de Endpoints con Curl",
    description: "Ejecuta un comando para probar un endpoint desde la terminal.",
    isCode: true,
    isTerminal: true,
    question: {
      questionText: "En un terminal Bash, usa curl para realizar una solicitud GET a 'https://api.example.com/health'"
    }
  }, {
    group: "4",
    title: "Localizando Configuración de CORS",
    description: "Localiza la línea donde se configura el permiso de origen en CORS.",
    isRelevantLine: true,
    question: {
      questionText: "Selecciona la línea donde se configura el origen permitido en CORS:",
      code: "const app = express();\nconst cors = require('cors');\napp.use(cors({ origin: 'https://miapp.com' }));\napp.listen(8080);",
      answer: 3
    }
  }, {
    group: "4",
    title: "Construye tu Aplicación",
    isConversationReview: true,
    description: "Observa cómo tu app obtiene rutas backend, datos persistentes, manejo de errores y autenticación.",
    question: {
      questionText: "Tu app ya puede comunicarse con un backend y proteger datos. ¡Agreguemos ese progreso al proyecto!",
      range: [108, 128]
    }
  }, {
    group: "5",
    title: "Plataformas Serverless Gestionadas y sus Compromisos",
    description: "Compara plataformas backend gestionadas con infraestructura aprovisionada por tu equipo.",
    isMultipleChoice: true,
    question: {
      questionText: "¿Qué compromiso distingue mejor a una plataforma gestionada como Firebase o Supabase de operar tu propio VPS?",
      options: ["El proveedor gestiona gran parte del aprovisionamiento, escalado y parches, mientras la app acepta restricciones y precios específicos de la plataforma.", "Tu equipo obtiene control total del sistema operativo, pero debe configurar capacidad y parches manualmente.", "La plataforma puede alojar archivos estáticos, pero no ofrece autenticación ni bases de datos.", "La plataforma siempre cuesta menos que un VPS sin importar el nivel de tráfico."],
      answer: "El proveedor gestiona gran parte del aprovisionamiento, escalado y parches, mientras la app acepta restricciones y precios específicos de la plataforma."
    }
  }, {
    group: "5",
    title: "Escritura de C\xF3digo: Cargador de Variables de Entorno",
    description: "Escribe una funci\xF3n auxiliar para extraer configuraci\xF3n de process.env con valores por defecto.",
    isCode: true,
    question: {
      questionText: "Escribe una funci\xF3n obtenerConfigBD() que extraiga DB_HOST y DB_PORT de process.env con valores por defecto ('localhost' y 5432):",
      starterCode: "function obtenerConfigBD() {\n  // Lee DB_HOST y DB_PORT e incluye ambos valores por defecto.\n}",
      answer: "function obtenerConfigBD() {\n  return {\n    host: process.env.DB_HOST || 'localhost',\n    port: Number(process.env.DB_PORT) || 5432\n  };\n}",
      tests: ["Devuelve claves host y port", "Aplica valores por defecto si no existen las variables"]
    }
  }, {
    group: "5",
    title: "Respuesta Corta: Registro de Cambios en Git",
    description: "Identifica el comando de Git para guardar una versi\xF3n en el historial.",
    isSingleLineText: true,
    question: {
      questionText: "\xBFQu\xE9 comando de Git se utiliza para registrar los archivos preparados en el historial con un mensaje descriptivo (ej. con la opci\xF3n -m)?",
      answer: "git commit"
    }
  }, {
    group: "5",
    title: "Ciclo Diario de Desarrollo con Git",
    description: "Ordena las líneas para crear un commit y sincronizarlo con GitHub.",
    isParsonsProblem: true,
    question: {
      questionText: "Ordena los comandos cronológicos de Git para preparar, confirmar y subir cambios:",
      lines: ["git status", "git add .", 'git commit -m "feat: agregar flujo de mensajes en tiempo real"', "git push origin main"],
      answer: ["git status", "git add .", 'git commit -m "feat: agregar flujo de mensajes en tiempo real"', "git push origin main"]
    }
  }, {
    group: "5",
    title: "Práctica de Terminal: Clonar un Repositorio de GitHub",
    description: "Clona un repositorio remoto en tu computadora desde la terminal.",
    isCode: true,
    isTerminal: true,
    question: {
      questionText: "En un entorno de terminal Bash, ingresa el comando para clonar https://github.com/example/web-app.git"
    }
  }, {
    group: "5",
    title: "Corrigiendo Configuración de Firebase Incompleta",
    description: "Corrige el objeto de configuración de Firebase para incluir projectId.",
    isFixBug: true,
    question: {
      questionText: "Corrige la configuración de Firebase abajo para incluir projectId:",
      starterCode: "const firebaseConfig = {\n  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,\n  authDomain: 'app.firebaseapp.com'\n};\nconst app = initializeApp(firebaseConfig);",
      answer: "const firebaseConfig = {\n  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,\n  authDomain: 'app.firebaseapp.com',\n  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID\n};\nconst app = initializeApp(firebaseConfig);",
      tests: ["Incluye projectId desde import.meta.env", "Pasa una configuración de cliente válida de Vite a initializeApp"]
    }
  }, {
    group: "5",
    title: "Refactorizando a SDK Modular de Firebase v9",
    description: "Refactoriza llamadas heredadas de Firebase v8 a funciones modulares de v9.",
    isRefactoringChallenge: true,
    question: {
      questionText: "Refactoriza la llamada heredada a la sintaxis modular v9 de signInWithPopup:",
      starterCode: "function login(provider) {\n  return firebase.auth().signInWithPopup(provider);\n}",
      answer: "function login(provider) {\n  return signInWithPopup(auth, provider);\n}",
      tests: ["Utiliza signInWithPopup(auth, provider)", "Elimina la sintaxis de espacio de nombres heredada"]
    }
  }, {
    showPreview: true,
    group: "5",
    title: "Suscripción al Estado de Autenticación (onAuthStateChanged)",
    description: "Mantén el estado del cliente sincronizado con el inicio/cierre de sesión.",
    isFillCodeBlanks: true,
    question: {
      previewCode: "function ObservadorEstadoAutenticacionEnVivo() {\n  const [usuario, setUsuario] = React.useState({ correo: 'dev@sunset.io', nombre: 'Alex' });\n\n  return (\n    <div style={{ padding: '6px 8px', fontFamily: 'system-ui, sans-serif' }}>\n      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 7 }}>\n        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>\n          <div style={{ width: 24, height: 24, borderRadius: '50%', background: usuario ? '#ec4899' : '#94a3b8', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>\n            {usuario ? usuario.nombre[0] : '?'}\n          </div>\n          <div>\n            <strong style={{ fontSize: 12, color: '#0f172a' }}>{usuario ? usuario.correo : 'Sesi\xF3n cerrada'}</strong>\n            <p style={{ margin: 0, fontSize: 10.5, color: usuario ? '#10b981' : '#64748b' }}>{usuario ? 'onAuthStateChanged: Activo' : 'Sin sesi\xF3n activa'}</p>\n          </div>\n        </div>\n        <button\n          onClick={() => setUsuario(usuario ? null : { correo: 'dev@sunset.io', nombre: 'Alex' })}\n          style={{ background: usuario ? '#ef4444' : '#10b981', color: 'white', border: 0, borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}\n        >\n          {usuario ? 'Cerrar sesi\xF3n' : 'Iniciar sesi\xF3n'}\n        </button>\n      </div>\n    </div>\n  );\n}",
      questionText: "Completa la suscripción al observador de autenticación:",
      template: "const cancelar = {{onAuthStateChanged}}(\n  auth,\n  (usuarioActual) => {\n    {{setUsuario}}(usuarioActual);\n  }\n);",
      blanks: [{
        key: "onAuthStateChanged",
        label: "Función observadora de Auth",
        hint: "onAuthStateChanged"
      }, {
        key: "setUsuario",
        label: "Setter de estado en React",
        hint: "setUsuario"
      }],
      answer: {
        onAuthStateChanged: "onAuthStateChanged",
        setUsuario: "setUsuario"
      }
    }
  }, {
    showPreview: true,
    group: "5",
    title: "Mejor Implementación: Suscripción en Tiempo Real a Firestore",
    description: "Selecciona la implementación que se suscribe a Firestore y se limpia en el desmontaje.",
    isBestImplementation: true,
    question: {
      previewCode: "function LibroVisitasFirestoreEnVivo() {\n  const [mensajes, setMensajes] = React.useState([\n    { id: '1', text: 'Conectando a Firestore...' }\n  ]);\n  const [texto, setTexto] = React.useState('');\n  const [publicando, setPublicando] = React.useState(false);\n\n  React.useEffect(() => {\n    try {\n      if (!database || typeof onSnapshot !== 'function') return;\n      const expCol = collection(database, 'experiments');\n      const cancelar = onSnapshot(expCol, (snapshot) => {\n        const lista = [];\n        snapshot.forEach((d) => {\n          lista.push({ id: d.id, ...d.data() });\n        });\n        lista.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));\n        if (lista.length > 0) {\n          setMensajes(lista.slice(0, 2));\n        }\n      }, (err) => console.log('Firestore snapshot fallback:', err.message));\n      return () => cancelar();\n    } catch (err) {\n      console.log('Error en vista previa:', err);\n    }\n  }, []);\n\n  const enviar = async (e) => {\n    e.preventDefault();\n    if (!texto.trim() || publicando) return;\n    setPublicando(true);\n    try {\n      if (database && typeof addDoc === 'function') {\n        await addDoc(collection(database, 'experiments'), {\n          text: texto.trim(),\n          timestamp: Date.now()\n        });\n      } else {\n        setMensajes(prev => [{ id: String(Date.now()), text: texto.trim() }, ...prev.slice(0, 1)]);\n      }\n      setTexto('');\n    } catch (e) {\n      console.log('Error enviando a experiments:', e);\n    } finally {\n      setPublicando(false);\n    }\n  };\n\n  return (\n    <div style={{ padding: '6px 8px', fontFamily: 'system-ui, sans-serif' }}>\n      <form onSubmit={enviar} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>\n        <input\n          value={texto}\n          onChange={(e) => setTexto(e.target.value)}\n          placeholder=\"Enviar mensaje en vivo a Firestore...\"\n          style={{ flex: 1, padding: '5px 8px', fontSize: 12, border: '1.5px solid #cbd5e1', borderRadius: 6, outline: 'none' }}\n        />\n        <button\n          type=\"submit\"\n          disabled={publicando}\n          style={{ background: '#ec4899', color: 'white', border: 0, borderRadius: 6, padding: '5px 12px', fontSize: 11.5, fontWeight: 700, cursor: 'pointer' }}\n        >\n          {publicando ? '...' : 'Enviar'}\n        </button>\n      </form>\n      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>\n        {mensajes.map((m) => (\n          <div key={m.id} style={{ padding: '3px 8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 5, fontSize: 11, color: '#334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>\n            <span style={{ fontWeight: 500 }}>{m.text || 'Entrada en la nube'}</span>\n            <span style={{ fontSize: 9.5, color: '#10b981', fontWeight: 700 }}>EN VIVO \u2713</span>\n          </div>\n        ))}\n      </div>\n    </div>\n  );\n}",
      questionText: "¿Qué patrón de useEffect se suscribe a Firestore en tiempo real y cancela la suscripción al desmontar?",
      options: ["useEffect(() => {\n  const q = query(\n    collection(db, 'messages'),\n    orderBy('createdAt')\n  );\n\n  const unsubscribe = onSnapshot(\n    q,\n    (snapshot) => {\n      setMessages(\n        snapshot.docs.map((d) => ({\n          id: d.id,\n          ...d.data()\n        }))\n      );\n    }\n  );\n\n  return () => unsubscribe();\n}, []);", "useEffect(() => {\n  onSnapshot(\n    collection(db, 'messages'),\n    (s) => setMessages(s.docs)\n  );\n}, []);", "useEffect(() => {\n  const data = getDocs(\n    collection(db, 'messages')\n  );\n  setMessages(data);\n});", "useEffect(() => {\n  setInterval(\n    () => onSnapshot(db, setMessages),\n    1000\n  );\n}, []);"],
      answer: "useEffect(() => {\n  const q = query(\n    collection(db, 'messages'),\n    orderBy('createdAt')\n  );\n\n  const unsubscribe = onSnapshot(\n    q,\n    (snapshot) => {\n      setMessages(\n        snapshot.docs.map((d) => ({\n          id: d.id,\n          ...d.data()\n        }))\n      );\n    }\n  );\n\n  return () => unsubscribe();\n}, []);"
    }
  }, {
    showPreview: true,
    group: "5",
    title: "Reglas de Seguridad en Cloud Firestore",
    description: "Garantiza que los usuarios autenticados solo puedan leer y escribir su propio perfil.",
    isCodeCompletion: true,
    question: {
      previewCode: "function CompuertaReglasSeguridadFirestore() {\n  const [authUid, setAuthUid] = React.useState('alex_99');\n  const targetDocUid = 'alex_99';\n  const estaPermitido = authUid === targetDocUid;\n\n  return (\n    <div style={{ padding: '6px 4px', fontFamily: 'system-ui, sans-serif' }}>\n      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>\n        <span style={{ fontSize: 11, color: '#475569', fontWeight: 700 }}>Estado Auth (request.auth.uid):</span>\n        <div style={{ display: 'flex', gap: 4 }}>\n          {['alex_99', null].map(u => (\n            <button key={String(u)} onClick={() => setAuthUid(u)} style={{ border: 0, borderRadius: 5, padding: '3px 6px', fontSize: 10.5, cursor: 'pointer', background: authUid === u ? '#0f172a' : '#e2e8f0', color: authUid === u ? 'white' : '#334155', fontWeight: 600 }}>{u ? 'user: alex_99' : 'An\xF3nimo / Null'}</button>\n          ))}\n        </div>\n      </div>\n      <div style={{ background: estaPermitido ? '#f0fdf4' : '#fef2f2', border: `1.5px solid ${estaPermitido ? '#86efac' : '#fca5a5'}`, padding: '6px 10px', borderRadius: 7, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>\n        <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#0f172a' }}>WRITE /users/{targetDocUid}</span>\n        <span style={{ fontSize: 10.5, fontWeight: 700, color: estaPermitido ? '#15803d' : '#b91c1c' }}>\n          {estaPermitido ? '\uD83D\uDFE2 PERMITIDO (200 OK)' : '\uD83D\uDD34 DENEGADO (403 Permiso Denegado)'}\n        </span>\n      </div>\n    </div>\n  );\n}",
      questionText: "¿Qué regla de seguridad garantiza que los usuarios autenticados solo lean y escriban su propio documento de perfil?",
      options: ["match /usuarios/{usuarioId} {\n  allow read, write: if request.auth != null && request.auth.uid == usuarioId;\n}", "match /usuarios/{usuarioId} {\n  allow read, write: if true;\n}", "match /usuarios/{usuarioId} {\n  allow read, write: if request.time > 0;\n}", "match /usuarios/{usuarioId} {\n  allow read: false; allow write: false;\n}"],
      answer: "match /usuarios/{usuarioId} {\n  allow read, write: if request.auth != null && request.auth.uid == usuarioId;\n}"
    }
  }, {
    group: "5",
    title: "Respuesta Abierta: Seguridad de Secretos en el Frontend",
    description: "Explica por qu\xE9 los secretos del servidor nunca deben incluirse en el c\xF3digo cliente.",
    isText: true,
    question: {
      questionText: "\xBFPor qu\xE9 es peligroso incluir claves privadas de API, credenciales de base de datos o tokens secretos dentro del c\xF3digo frontend o variables de entorno del cliente?"
    }
  }, {
    group: "5",
    title: "Mejor Implementación: Variables de Entorno en el Cliente",
    description: "Lee correctamente la configuración pública de Firebase en una aplicación Vite.",
    isBestImplementation: true,
    question: {
      questionText: "¿Qué fragmento lee correctamente la configuración pública de Firebase en Vite, donde los valores VITE_* se incluyen en el bundle y son visibles?",
      options: ["const firebaseConfig = {\n  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,\n  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID\n};", "const firebaseConfig = {\n  apiKey: process.env.SECRET_PRIVATE_KEY\n};", "const firebaseConfig = window.env;", "const firebaseConfig = {\n  apiKey: document.cookie\n};"],
      answer: "const firebaseConfig = {\n  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,\n  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID\n};"
    }
  }, {
    group: "5",
    title: "Localizando Error de Cancelación de Inicio de Sesión",
    description: "Identifica la línea donde el bloque catch intercepta cuando el usuario cierra la ventana de login.",
    isRelevantLine: true,
    question: {
      questionText: "Selecciona la línea donde el bloque catch maneja la cancelación del popup:",
      code: "const handleLogin = async () => {\n  try {\n    await signInWithPopup(auth, provider);\n  } catch (error) {\n    console.warn('Inicio de sesión cancelado:', error.message);\n  }\n};",
      answer: 5
    }
  }, {
    group: "5",
    title: "Acciones de Ramas y Colaboraci\xF3n en Git",
    description: "Relaciona comandos de gesti\xF3n de ramas en Git con sus operaciones.",
    isMatchPairs: true,
    question: {
      questionText: "Relaciona cada comando de flujo de ramas en Git con su operaci\xF3n exacta:",
      pairs: [{
        left: "git checkout -b funcion",
        right: "Crea y cambia a una nueva rama de funcionalidad"
      }, {
        left: "git merge funcion",
        right: "Combina los commits de la rama en la rama actual"
      }, {
        left: "git branch -d funcion",
        right: "Elimina una rama local que ya fue fusionada"
      }, {
        left: "git pull origin main",
        right: "Descarga y combina los \xFAltimos cambios remotos"
      }],
      answer: {
        "git checkout -b funcion": "Crea y cambia a una nueva rama de funcionalidad",
        "git merge funcion": "Combina los commits de la rama en la rama actual",
        "git branch -d funcion": "Elimina una rama local que ya fue fusionada",
        "git pull origin main": "Descarga y combina los \xFAltimos cambios remotos"
      }
    }
  }, {
    group: "5",
    title: "Corrigiendo Fuga de Memoria en Escuchador de Auth",
    description: "Devuelve la función de limpieza desde useEffect para detener el listener al desmontar.",
    isFixBug: true,
    question: {
      questionText: "Corrige el hook useEffect para limpiar el escuchador de auth al desmontar:",
      starterCode: "useEffect(() => {\n  const unsubscribe = onAuthStateChanged(auth, setUser);\n}, []);",
      answer: "useEffect(() => {\n  const unsubscribe = onAuthStateChanged(auth, setUser);\n  return () => unsubscribe();\n}, []);",
      tests: ["Devuelve función de limpieza () => unsubscribe()", "Evita fugas de memoria al desmontar"]
    }
  }, {
    group: "5",
    title: "Práctica de Terminal: Iniciar Servidor de Desarrollo Local",
    description: "Inicia el servidor local de desarrollo utilizando npm run dev.",
    isCode: true,
    isTerminal: true,
    question: {
      questionText: "En un terminal Bash, ingresa el comando para iniciar el servidor de desarrollo local usando npm"
    }
  }, {
    group: "5",
    title: "Fases del Pipeline de Despliegue CI/CD",
    description: "Ordena las fases automatizadas estándar de Integración y Despliegue Continuos.",
    isSelectOrder: true,
    question: {
      questionText: "Ordena cronológicamente las fases de un pipeline CI/CD automatizado:",
      options: ["1. El desarrollador sube un commit a GitHub", "2. El pipeline de CI ejecuta la suite de pruebas automatizadas", "3. La herramienta de compilación genera el paquete optimizado de producción", "4. El pipeline de CD despliega los artefactos en el CDN global"],
      answer: ["1. El desarrollador sube un commit a GitHub", "2. El pipeline de CI ejecuta la suite de pruebas automatizadas", "3. La herramienta de compilación genera el paquete optimizado de producción", "4. El pipeline de CD despliega los artefactos en el CDN global"]
    }
  }, {
    group: "5",
    title: "Refactorizando Llamadas de Firebase a Capa de Servicios",
    description: "Extrae operaciones de base de datos en una función de servicio reutilizable.",
    isRefactoringChallenge: true,
    question: {
      questionText: "Refactoriza la escritura en Firestore en una función de servicio crearPublicacion aislada:",
      starterCode: "function handleGuardar(texto) {\n  addDoc(collection(db, 'publicaciones'), { texto, fecha: Date.now() });\n}",
      answer: "export const crearPublicacion = (texto) => {\n  return addDoc(collection(db, 'publicaciones'), { texto, fecha: Date.now() });\n};",
      tests: ["Exporta la función independiente crearPublicacion", "Devuelve la promesa de addDoc"]
    }
  }, {
    group: "5",
    title: "Monitoreo en Producción y Reporte de Errores",
    description: "Selecciona las métricas clave para supervisar aplicaciones web en vivo.",
    isMultipleAnswerChoice: true,
    question: {
      questionText: "Selecciona todas las métricas y herramientas vitales para monitorear aplicaciones web en producción:",
      options: ["Rastreo de errores en tiempo real en el cliente JS (p. ej. Sentry)", "Latencia de API y percentiles de tiempo de respuesta (p95 / p99)", "Core Web Vitals y Largest Contentful Paint (LCP)", "Cuotas de lectura/escritura en base de datos y tiempos de consulta", "Temperatura física de la pantalla del usuario"],
      answer: ["Rastreo de errores en tiempo real en el cliente JS (p. ej. Sentry)", "Latencia de API y percentiles de tiempo de respuesta (p95 / p99)", "Core Web Vitals y Largest Contentful Paint (LCP)", "Cuotas de lectura/escritura en base de datos y tiempos de consulta"]
    }
  }, {
    group: "5",
    title: "Seguimiento de Código: Flujo Completo de Auth y Consultas",
    description: "Rastrea la verificación de sesión antes de consultar documentos protegidos.",
    isCodeTracing: true,
    question: {
      questionText: "Predice el resultado de autorización después de comprobar autenticación, verificación y propiedad del documento:",
      code: "const usuario = { uid: 'u1', verificado: true };\nconst propietarioDocumento = 'u1';\nconst puedeEditar = Boolean(\n  usuario &&\n  usuario.verificado &&\n  usuario.uid === propietarioDocumento\n);\nconsole.log(puedeEditar ? 'Consulta permitida' : 'Consulta bloqueada');",
      options: ["Consulta permitida", "Consulta bloqueada", "Invitado - false", "undefined"],
      answer: "Consulta permitida"
    }
  }, {
    group: "5",
    title: "Construye tu Aplicación",
    isConversationReview: true,
    description: "Celebra cómo tu app creció desde una idea hasta convertirse en un proyecto full-stack conectado y listo para publicar.",
    question: {
      questionText: "Tu proyecto alcanzó su hito de publicación. ¡Celebremos todo el recorrido!",
      range: [130, 149]
    }
  }]
};
export const loot = buildCourseLoot(steps);

// Tutorial-only loot meter for the Python track
export const pythonLoot = [{},
// 0 – Introduction placeholder (no monetary movement yet)

// 1 – Understanding Coding
{
  monetaryValue: 0,
  "py-en": "Pure theory—no immediate billable skill."
},
// 2 – Sequence of Program Execution
{
  monetaryValue: 0,
  "py-en": "Execution-flow insight is still unpaid groundwork."
},
// 3 – Introduction to Variables
{
  monetaryValue: 125,
  "py-en": "Variable basics open tiny scripting gigs (~$125)."
},
// 4 – Understanding List Declarations
{
  monetaryValue: 250,
  "py-en": "List handling enables simple automation scripts."
},
// 5 – Variable Assignment in Python
{
  monetaryValue: 250,
  "py-en": "Confident assignment lets you edit configs safely."
},
// 6 – Understanding Data Types
{
  monetaryValue: 300,
  "py-en": "Type awareness prevents bugs—marketable skill bump."
},
// 7 – Purpose of Variables
{
  monetaryValue: 300,
  "py-en": "Explaining variable intent shows code clarity to employers."
},
// 8 – Bash Terminal Practice: Changing Directories
{
  monetaryValue: 375,
  "py-en": "CLI navigation preps you for junior DevOps chores."
},
// 9 – Review With AI Conversation (optional)
{
  monetaryValue: 375,
  "py-en": "Conversation recap cements knowledge—earnings hold steady."
}, /* 1 */{
  monetaryValue: 375,
  "py-en": "Primitive-type fluency lands basic data-cleanup gigs."
}, /* 2 */{
  monetaryValue: 425,
  "py-en": "Function workflow qualifies you for tiny utility scripts."
}, /* 3 */{
  monetaryValue: 500,
  "py-en": "Authoring functions opens low-stakes automation work."
}, /* 4 */{
  monetaryValue: 500,
  "py-en": "Explaining functions shows architectural awareness."
}, /* 5 */{
  monetaryValue: 625,
  "py-en": "Branching logic unlocks decision-making code tasks."
}, /* 6 */{
  monetaryValue: 750,
  "py-en": "Flow-control precision reduces QA time for small apps."
}, /* 7 */{
  monetaryValue: 875,
  "py-en": "Hands-on conditionals prove practical coding ability."
}, /* 8 */{
  monetaryValue: 1000,
  "py-en": "Operator insight tightens code correctness."
}, /* 9 */{
  monetaryValue: 1000,
  "py-en": "Applying conditionals to business logic adds value."
}, /*10 */{
  monetaryValue: 1125,
  "py-en": "CLI help skills prep you for DevOps workflows."
}, /*11 */{
  monetaryValue: 1250,
  "py-en": "Loop mastery automates repetitive data tasks."
}, /*12 */{
  monetaryValue: 1375,
  "py-en": "Understanding loop order trims runtime errors."
}, /*13 */{
  monetaryValue: 1500,
  "py-en": "Writing loops nets entry-level data-wrangling jobs."
}, /*14 */{
  monetaryValue: 1500,
  "py-en": "Articulating loop use cases shows system thinking."
}, /*15 */{
  monetaryValue: 1625,
  "py-en": "List methods speed up ETL and small-scale tooling."
}, /*16 */{
  monetaryValue: 1750,
  "py-en": "Sequencing list ops improves data-pipeline quality."
}, /*17 */{
  monetaryValue: 1875,
  "py-en": "Fluent list manipulation boosts productivity rates."
}, /*18 */{
  monetaryValue: 1875,
  "py-en": "Mapping list use cases to products signals insight."
}, /*19 */{
  monetaryValue: 2000,
  "py-en": "Directory commands add deploy-script credibility."
}, /*20 */{
  monetaryValue: 2250,
  "py-en": "Predicting complex output shows mental-model mastery."
}, /*21 */{
  monetaryValue: 2250,
  "py-en": "AI recap consolidates gains—value steadies here."
}, {
  monetaryValue: 2500,
  "py-en": "Basic OOP concepts spark entry-level maintenance gigs."
}, {
  monetaryValue: 3750,
  "py-en": "Constructor mastery scaffolds clean, reusable classes."
}, {
  monetaryValue: 3875,
  "py-en": "Articulating __init__ shows design-pattern awareness."
}, {
  monetaryValue: 4250,
  "py-en": "Instance creation enables API-client & SDK tasks."
}, {
  monetaryValue: 4500,
  "py-en": "Methods demonstrate behavior encapsulation."
}, {
  monetaryValue: 4625,
  "py-en": "Proper self usage signals readiness for code reviews."
}, {
  monetaryValue: 4750,
  "py-en": "Attribute modeling improves data-layer flexibility."
}, {
  monetaryValue: 4875,
  "py-en": "Safe property access reduces production-bug risk."
}, {
  monetaryValue: 5000,
  "py-en": "Confident attribute updates unlock CRUD feature work."
}, {
  monetaryValue: 6000,
  "py-en": "Inheritance insight opens framework customization."
}, {
  monetaryValue: 6750,
  "py-en": "Subclassing skills qualify you for component libraries."
}, {
  monetaryValue: 7500,
  "py-en": "Polymorphic overrides raise solid junior-dev salaries."
}, {
  monetaryValue: 7625,
  "py-en": "Encapsulation theory guards data integrity."
}, {
  monetaryValue: 8250,
  "py-en": "Getters/setters show production-ready design."
}, {
  monetaryValue: 8250,
  "py-en": "Terminology locked in—value holds steady."
}, {
  monetaryValue: 9500,
  "py-en": "Capstone project proves deliverable-ready OOP skills."
}, {
  monetaryValue: 9500,
  "py-en": "Shell output practice reinforces value—no bump."
}, {
  monetaryValue: 9500,
  "py-en": "AI recap solidifies OOP foundation—earnings level off."
}, {
  monetaryValue: 20000,
  "py-en": "React component basics expand full-stack horizons."
}, {
  monetaryValue: 21000,
  "py-en": "Props & state boost UI salary potential."
}, {
  monetaryValue: 22000,
  "py-en": "State-driven rendering marks you as front-end capable."
}, {
  monetaryValue: 23000,
  "py-en": "Building a component proves hands-on UI delivery."
}, {
  monetaryValue: 24000,
  "py-en": "Event handling shows interactive UI chops."
}, {
  monetaryValue: 25000,
  "py-en": "useState mastery qualifies you for junior React roles."
}, {
  monetaryValue: 26000,
  "py-en": "Prop passing skills enhance component reusability."
}, {
  monetaryValue: 27000,
  "py-en": "Dynamic props implementation sharpens architecture."
}, {
  monetaryValue: 28000,
  "py-en": "Distinguishing props vs state signals design maturity."
}, {
  monetaryValue: 29000,
  "py-en": "CLI file ops prep build-workflow automation."
}, {
  monetaryValue: 30000,
  "py-en": "Styling components showcases product-ready polish."
}, {
  monetaryValue: 31000,
  "py-en": "Flexbox layout fluency speeds responsive design."
}, {
  monetaryValue: 32000,
  "py-en": "Lifting state enables multi-component orchestration."
}, {
  monetaryValue: 33000,
  "py-en": "useEffect usage signals side-effect competence."
}, {
  monetaryValue: 34000,
  "py-en": "Lifecycle awareness supports performance tuning."
}, {
  monetaryValue: 35000,
  "py-en": "Async data fetching demonstrates API integration."
}, {
  monetaryValue: 37500,
  "py-en": "Complete Tweet app exhibits full-stack delivery."
}, {
  monetaryValue: 40000,
  "py-en": "Project setup mastery shows dev-environment autonomy."
}, {
  monetaryValue: 42500,
  "py-en": "Vite workflow accelerates modern build pipelines."
}, {
  monetaryValue: 45000,
  "py-en": "Comprehensive review cements senior-track value."
}, /* 1 */{
  monetaryValue: 46000,
  "py-en": "Backend fundamentals introduce server-side logic know-how."
}, /* 2 */{
  monetaryValue: 48000,
  "py-en": "Spotting core duties sharpens your roadmap to employment."
}, /* 3 */{
  monetaryValue: 50000,
  "py-en": "Multi-responsibility insight boosts junior-dev readiness."
}, /* 4 */{
  monetaryValue: 51000,
  "py-en": "Terminal fluency powers everyday backend tasks."
}, /* 5 */{
  monetaryValue: 52000,
  "py-en": "Upgrading pip keeps environments modern and secure."
}, /* 6 */{
  monetaryValue: 53000,
  "py-en": "Package installs unlock framework experimentation."
}, /* 7 */{
  monetaryValue: 54000,
  "py-en": "Auth terminology safeguards future user data."
}, /* 8 */{
  monetaryValue: 55000,
  "py-en": "Database-type literacy guides sound architecture choices."
}, /* 9 */{
  monetaryValue: 56000,
  "py-en": "PostgreSQL connection skills impress hiring managers."
}, /*10*/{
  monetaryValue: 57000,
  "py-en": "Django bootstrap showcases rapid project setup."
}, /*11*/{
  monetaryValue: 59000,
  "py-en": "Data-storage best practices prove reliability mindset."
}, /*12*/{
  monetaryValue: 61000,
  "py-en": "SQLAlchemy CRUD shows ORM proficiency in action."
}, /*13*/{
  monetaryValue: 62000,
  "py-en": "User-lookup code demonstrates practical DB use."
}, /*14*/{
  monetaryValue: 63000,
  "py-en": "Secure queries highlight credential-handling care."
}, /*15*/{
  monetaryValue: 64000,
  "py-en": "JWT flow maps modern authentication pipelines."
}, /*16*/{
  monetaryValue: 65000,
  "py-en": "OAuth know-how enables third-party sign-ins."
}, /*17*/{
  monetaryValue: 66000,
  "py-en": "Environment variables keep secrets safe in code."
}, /*18*/{
  monetaryValue: 67000,
  "py-en": "Model relationships design scalable data schemas."
}, /*19*/{
  monetaryValue: 68000,
  "py-en": "REST method insight preps you for API work."
}, /*20*/{
  monetaryValue: 69000,
  "py-en": "Building a JWT system shows end-to-end security chops."
}, /*21*/{
  monetaryValue: 70000,
  "py-en": "Deploying with Gunicorn caps senior-track salary bands."
}, /*22 – Review (optional)*/{
  monetaryValue: 70000,
  "py-en": "AI recap locks in knowledge—value plateaus here."
}, /* 1  */{
  monetaryValue: 75000,
  "py-en": "Serverless benefits raise your market ceiling immediately."
}, /* 2  */{
  monetaryValue: 76000,
  "py-en": "VSCode workflow fluency boosts day-one productivity value."
}, /* 3  */{
  monetaryValue: 77000,
  "py-en": "Node + npm installs unlock cross-stack tooling jobs."
}, /* 4  */{
  monetaryValue: 78000,
  "py-en": "Dependency installs prove environment-setup competence."
}, /* 5  */{
  monetaryValue: 79000,
  "py-en": "Firebase CLI install shows command-line confidence."
}, /* 6  */{
  monetaryValue: 81000,
  "py-en": "Project init demonstrates cloud project bootstrapping."
}, /* 7  */{
  monetaryValue: 83000,
  "py-en": "Choosing services reveals solution-architecture judgment."
}, /* 8  */{
  monetaryValue: 86000,
  "py-en": "Admin-SDK config signals secure credential handling."
}, /* 9  */{
  monetaryValue: 88000,
  "py-en": "Firestore client setup proves NoSQL ready-for-prod skill."
}, /* 10 */{
  monetaryValue: 90000,
  "py-en": "Auth concepts mark you as user-management capable."
}, /* 11 */{
  monetaryValue: 92000,
  "py-en": "Programmatic user-creation meets SaaS onboarding needs."
}, /* 12 */{
  monetaryValue: 94000,
  "py-en": "ID-token verification shows secure session handling."
}, /* 13 */{
  monetaryValue: 97000,
  "py-en": "CRUD mastery enables full data-layer ownership."
}, /* 14 */{
  monetaryValue: 100000,
  "py-en": "Cloud Functions coding pushes you into six-figure tier."
}, /* 15 */{
  monetaryValue: 103000,
  "py-en": "Local emulation shortens dev cycles—high ROI for teams."
}, /* 16 */{
  monetaryValue: 108000,
  "py-en": "Production deploy proficiency justifies senior rates."
}, /* 17 */{
  monetaryValue: 110000,
  "py-en": "Storage uploads add scalable asset-handling expertise."
}, /* 18 */{
  monetaryValue: 112000,
  "py-en": "Security-rules insight protects data at enterprise scale."
}, /* 19 */{
  monetaryValue: 115000,
  "py-en": "Monitoring & analytics drive performance optimization value."
}, /* 20 */{
  monetaryValue: 118000,
  "py-en": "Extension know-how speeds feature delivery for clients."
}, /* 21 – Review */{
  monetaryValue: 120000,
  "py-en": "Comprehensive review crowns you at senior-full-stack tier."
}];

// Swift Tutorial loot meter
export const swiftLoot = [{},
// 0 – Introduction placeholder (no monetary movement)

// 1 – Understanding Coding
{
  monetaryValue: 0,
  "swift-en": "Pure theory—no immediate billable skill."
},
// 2 – Sequence of Program Execution
{
  monetaryValue: 0,
  "swift-en": "Execution-flow insight is still unpaid groundwork."
},
// 3 – Introduction to Variables
{
  monetaryValue: 125,
  "swift-en": "Variable basics open tiny scripting gigs (~$125)."
},
// 4 – Understanding List (Array) Declarations
{
  monetaryValue: 250,
  "swift-en": "Array handling enables simple automation scripts."
},
// 5 – Variable Assignment in Swift
{
  monetaryValue: 250,
  "swift-en": "Confident assignment lets you tweak configs safely."
},
// 6 – Understanding Data Types
{
  monetaryValue: 300,
  "swift-en": "Type awareness prevents bugs—marketable skill bump."
},
// 7 – Purpose of Variables
{
  monetaryValue: 300,
  "swift-en": "Explaining variable intent shows code clarity to employers."
},
// 8 – Bash Terminal Practice: cd
{
  monetaryValue: 375,
  "swift-en": "CLI navigation preps you for junior DevOps chores."
},
// 9 – Review With AI Conversation (optional)
{
  monetaryValue: 375,
  "swift-en": "Conversation recap cements knowledge—earnings hold steady."
},
// 1 – Data Types in Programming
{
  monetaryValue: 375,
  "swift-en": "Primitive-type fluency lands basic data-cleanup gigs."
},
// 2 – Steps to Create a Function
{
  monetaryValue: 425,
  "swift-en": "Function workflow qualifies you for tiny utility scripts."
},
// 3 – Writing a Simple Function
{
  monetaryValue: 500,
  "swift-en": "Authoring functions opens low-stakes automation work."
},
// 4 – Functions in Programming (concept question)
{
  monetaryValue: 500,
  "swift-en": "Explaining functions shows architectural awareness."
},
// 5 – Conditional Statements
{
  monetaryValue: 625,
  "swift-en": "Branching logic unlocks decision-making code tasks."
},
// 6 – Order of Conditional Checks
{
  monetaryValue: 750,
  "swift-en": "Flow-control precision reduces QA time for small apps."
},
// 7 – Implementing Conditional Logic
{
  monetaryValue: 875,
  "swift-en": "Hands-on conditionals prove practical coding ability."
},
// 8 – Logical Operator (single-line answer)
{
  monetaryValue: 1000,
  "swift-en": "Operator insight tightens code correctness."
},
// 9 – Real-world Use of Conditionals
{
  monetaryValue: 1000,
  "swift-en": "Applying conditionals to business logic adds value."
},
// 10 – Terminal Practice: help
{
  monetaryValue: 1125,
  "swift-en": "CLI help skills prep you for DevOps workflows."
},
// 11 – Loops in Programming
{
  monetaryValue: 1250,
  "swift-en": "Loop mastery automates repetitive data tasks."
},
// 12 – Sequence of Loop Execution
{
  monetaryValue: 1375,
  "swift-en": "Understanding loop order trims runtime errors."
},
// 13 – Creating a Loop (code)
{
  monetaryValue: 1500,
  "swift-en": "Writing loops nets entry-level data-wrangling jobs."
},
// 14 – Applications of Loops (text)
{
  monetaryValue: 1500,
  "swift-en": "Articulating loop use cases shows system thinking."
},
// 15 – Arrays in Swift (methods quiz)
{
  monetaryValue: 1625,
  "swift-en": "Array methods speed up ETL and small-scale tooling."
},
// 16 – Order of Array Operations
{
  monetaryValue: 1750,
  "swift-en": "Sequencing array ops improves data-pipeline quality."
},
// 17 – Manipulating Arrays (code)
{
  monetaryValue: 1875,
  "swift-en": "Fluent array manipulation boosts productivity rates."
},
// 18 – Use Cases for Arrays (text)
{
  monetaryValue: 1875,
  "swift-en": "Mapping array use cases to apps signals insight."
},
// 19 – Terminal Practice: mkdir
{
  monetaryValue: 2000,
  "swift-en": "Directory commands add deploy-script credibility."
},
// 20 – Advanced Coding Output (array comprehension logic)
{
  monetaryValue: 2250,
  "swift-en": "Predicting complex output shows mental-model mastery."
},
// 21 – Review With AI Conversation (optional)
{
  monetaryValue: 2250,
  "swift-en": "AI recap consolidates gains—value steadies here."
} /* 1 – Introduction to Objects */, {
  monetaryValue: 2500,
  "swift-en": "Object basics spark entry-level MVC maintenance gigs."
} /* 2 – Understanding the init Method */, {
  monetaryValue: 3750,
  "swift-en": "init mastery scaffolds reusable Swift classes."
} /* 3 – Purpose of the init Method */, {
  monetaryValue: 3875,
  "swift-en": "Explaining init shows design-pattern awareness."
} /* 4 – Creating an Instance of a Class */, {
  monetaryValue: 4250,
  "swift-en": "Instantiating objects enables model-layer tasks."
} /* 5 – Declaring a Method in a Class */, {
  monetaryValue: 4500,
  "swift-en": "Custom methods demonstrate behavior encapsulation."
} /* 6 – Using self Correctly */, {
  monetaryValue: 4625,
  "swift-en": "Proper use of self signals context mastery."
} /* 7 – Adding Properties to an Object */, {
  monetaryValue: 4750,
  "swift-en": "Property modeling improves data flexibility."
} /* 8 – Accessing & Modifying Properties */, {
  monetaryValue: 4875,
  "swift-en": "Safe property access reduces runtime errors."
} /* 9 – Modifying Object Properties */, {
  monetaryValue: 5000,
  "swift-en": "Dynamic updates unlock CRUD feature work."
} /* 10 – Understanding Inheritance */, {
  monetaryValue: 6000,
  "swift-en": "Inheritance insight opens framework customization."
} /* 11 – Implementing Inheritance */, {
  monetaryValue: 6750,
  "swift-en": "Subclassing skills qualify you for SDK extensions."
} /* 12 – Overriding Methods */, {
  monetaryValue: 7500,
  "swift-en": "Polymorphic overrides elevate junior-dev salaries."
} /* 13 – Understanding Encapsulation */, {
  monetaryValue: 7625,
  "swift-en": "Encapsulation theory guards state integrity."
} /* 14 – Implementing Encapsulation */, {
  monetaryValue: 8250,
  "swift-en": "Computed properties show production-ready design."
} /* 15 – Encapsulation Concept (one-word recall) */, {
  monetaryValue: 8250,
  "swift-en": "Term recall keeps value steady here."
} /* 16 – Combining Concepts Mini-Project */, {
  monetaryValue: 9500,
  "swift-en": "Capstone OOP project proves deliverable-ready skills."
} /* 17 – Printing in Code */, {
  monetaryValue: 9500,
  "swift-en": "Print practice reinforces fundamentals—value holds."
} /* 18 – Review With AI Conversation */, {
  monetaryValue: 9500,
  "swift-en": "AI recap solidifies OOP foundation—earnings level off."
} /* 1 – Introduction to SwiftUI Views */, {
  monetaryValue: 20000,
  "swift-en": "SwiftUI view basics unlock modern iOS UI gigs."
} /* 2 – Key Concepts in SwiftUI */, {
  monetaryValue: 21000,
  "swift-en": "State & modifiers boost UI architecture value."
} /* 3 – Effect of State Changes on a View */, {
  monetaryValue: 22000,
  "swift-en": "Reactive rendering marks you as SwiftUI-ready."
} /* 4 – Creating a Simple SwiftUI View */, {
  monetaryValue: 23000,
  "swift-en": "Hands-on view building shows deliverable skills."
} /* 5 – Handling Tap Gestures */, {
  monetaryValue: 24000,
  "swift-en": "Gesture handling demonstrates interactive chops."
} /* 6 – Managing State with @State */, {
  monetaryValue: 25000,
  "swift-en": "@State mastery qualifies you for junior iOS roles."
} /* 7 – View Properties */, {
  monetaryValue: 26000,
  "swift-en": "Data-injection patterns enhance component reuse."
} /* 8 – Passing and Using Properties */, {
  monetaryValue: 27000,
  "swift-en": "Dynamic props sharpen app architecture."
} /* 9 – Working with Properties and State Together */, {
  monetaryValue: 28000,
  "swift-en": "Distinguishing props vs state shows design maturity."
} /* 10 – Terminal Practice: ls */, {
  monetaryValue: 29000,
  "swift-en": "CLI file ops prep build-workflow automation."
} /* 11 – Styling SwiftUI Views */, {
  monetaryValue: 30000,
  "swift-en": "View styling proves product-ready polish."
} /* 12 – Using Stacks for Layout */, {
  monetaryValue: 31000,
  "swift-en": "Stack layouts speed responsive design."
} /* 13 – Lifting State Up */, {
  monetaryValue: 32000,
  "swift-en": "State sharing enables multi-view orchestration."
} /* 14 – Using onAppear for Side Effects */, {
  monetaryValue: 33000,
  "swift-en": "Lifecycle hooks signal side-effect competence."
} /* 15 – Understanding View Lifecycle */, {
  monetaryValue: 34000,
  "swift-en": "Lifecycle insight supports performance tuning."
} /* 16 – Fetching Data with async/await */, {
  monetaryValue: 35000,
  "swift-en": "Async data fetching shows API integration skill."
} /* 17 – Building a Complete Tweet App */, {
  monetaryValue: 37500,
  "swift-en": "End-to-end app showcases full-stack delivery."
} /* 18 – Terminal Practice: Swift Package */, {
  monetaryValue: 40000,
  "swift-en": "SwiftPM workflow demonstrates dev-environment autonomy."
} /* 19 – Creating a New SwiftUI Project */, {
  monetaryValue: 42500,
  "swift-en": "Xcode project setup accelerates shipping velocity."
} /* 20 – Review With AI Conversation (optional) */, {
  monetaryValue: 45000,
  "swift-en": "Comprehensive review cements senior-track value."
} /* 1 – Introduction to Swift Backend Engineering */, {
  monetaryValue: 46000,
  "swift-en": "Backend basics introduce server-side logic know-how."
} /* 2 – Main Lessons Overview (core duty) */, {
  monetaryValue: 48000,
  "swift-en": "Spotting core duties sharpens your employment roadmap."
} /* 3 – Key Responsibilities of Backend Engineering */, {
  monetaryValue: 50000,
  "swift-en": "Multi-responsibility insight boosts junior‐dev readiness."
} /* 4 – Interfacing with the Terminal */, {
  monetaryValue: 51000,
  "swift-en": "Terminal fluency powers everyday backend tasks."
} /* 5 – Installing the Vapor Toolbox */, {
  monetaryValue: 52000,
  "swift-en": "Vapor CLI install shows command-line confidence."
} /* 6 – Adding a Swift Package with SwiftPM */, {
  monetaryValue: 53000,
  "swift-en": "SwiftPM mastery unlocks dependency management skills."
} /* 7 – User Creation and Authentication (concept) */, {
  monetaryValue: 54000,
  "swift-en": "Auth terminology safeguards future user data."
} /* 8 – Database Foundations */, {
  monetaryValue: 55000,
  "swift-en": "DB-type literacy guides sound architecture choices."
} /* 9 – Connecting to PostgreSQL with Fluent */, {
  monetaryValue: 56000,
  "swift-en": "Postgres connection skills impress hiring managers."
} /*10 – Initiating a Vapor Project */, {
  monetaryValue: 57000,
  "swift-en": "Project bootstrap showcases rapid API setup."
} /*11 – Advanced Data-Storage Practices */, {
  monetaryValue: 59000,
  "swift-en": "Storage best-practices prove reliability mindset."
} /*12 – Configuring Fluent & Running Migrations */, {
  monetaryValue: 61000,
  "swift-en": "Fluent migrations show ORM proficiency in action."
} /*13 – Handling User Data */, {
  monetaryValue: 62000,
  "swift-en": "User-lookup code demonstrates practical DB use."
} /*14 – Retrieving User After Authentication */, {
  monetaryValue: 63000,
  "swift-en": "Secure queries highlight credential-handling care."
} /*15 – Understanding the Authentication Flow */, {
  monetaryValue: 64000,
  "swift-en": "JWT flow maps modern authentication pipelines."
} /*16 – OAuth Authentication */, {
  monetaryValue: 65000,
  "swift-en": "OAuth know-how enables third-party sign-ins."
} /*17 – Using Environment Variables */, {
  monetaryValue: 66000,
  "swift-en": "Environment variables keep secrets safe in code."
} /*18 – Database Relationships with Fluent */, {
  monetaryValue: 67000,
  "swift-en": "Model relationships design scalable data schemas."
} /*19 – Interfacing with an API */, {
  monetaryValue: 68000,
  "swift-en": "REST method insight preps you for API work."
} /*20 – Creating a JWT Authentication System */, {
  monetaryValue: 69000,
  "swift-en": "Building a JWT system shows end-to-end security chops."
} /*21 – Deploying a Vapor Application */, {
  monetaryValue: 70000,
  "swift-en": "Production deployment caps senior-track salary bands."
} /*22 – Review With AI Conversation (optional) */, {
  monetaryValue: 70000,
  "swift-en": "AI recap locks in knowledge—value plateaus here."
} /* 1 – Benefits of Serverless Cloud Platforms */, {
  monetaryValue: 75000,
  "swift-en": "Serverless know-how unlocks higher-margin app builds."
} /* 2 – Understanding Xcode */, {
  monetaryValue: 76000,
  "swift-en": "Xcode mastery speeds day-one productivity on iOS teams."
} /* 3 – Installing Swift & SwiftPM */, {
  monetaryValue: 77000,
  "swift-en": "SwiftPM fluency streamlines dependency management."
} /* 4 – Installing CocoaPods */, {
  monetaryValue: 78000,
  "swift-en": "CocoaPods install preps Firebase SDK integration."
} /* 5 – Adding Firebase via CocoaPods */, {
  monetaryValue: 79000,
  "swift-en": "Podfile wiring proves multi-module setup skills."
} /* 6 – Initializing a Firebase Project */, {
  monetaryValue: 81000,
  "swift-en": "Config-file onboarding shows cloud-project bootstrap."
} /* 7 – Selecting Firebase Modules */, {
  monetaryValue: 83000,
  "swift-en": "Service selection reveals solution-architecture sense."
} /* 8 – Configuring Firebase in AppDelegate */, {
  monetaryValue: 86000,
  "swift-en": "Runtime config signals secure SDK initialization."
} /* 9 – Setting Up Firestore */, {
  monetaryValue: 88000,
  "swift-en": "Firestore setup proves NoSQL data-layer chops."
} /* 10 – Understanding Authentication */, {
  monetaryValue: 90000,
  "swift-en": "Auth concepts mark you as user-management capable."
} /* 11 – Creating a User with FirebaseAuth */, {
  monetaryValue: 92000,
  "swift-en": "Programmatic sign-up enables SaaS onboarding flows."
} /* 12 – Verifying ID Tokens */, {
  monetaryValue: 94000,
  "swift-en": "Token verification shows secure session handling."
} /* 13 – CRUD with Firestore */, {
  monetaryValue: 97000,
  "swift-en": "CRUD mastery enables full data-layer ownership."
} /* 14 – Calling Cloud Functions */, {
  monetaryValue: 100000,
  "swift-en": "Function calls push you into six-figure tier."
} /* 15 – Local Emulation */, {
  monetaryValue: 103000,
  "swift-en": "Emulator workflow shortens dev cycles—high ROI."
} /* 16 – Deploying to Firebase */, {
  monetaryValue: 108000,
  "swift-en": "Production deploy proficiency justifies senior rates."
} /* 17 – Uploading to Storage */, {
  monetaryValue: 110000,
  "swift-en": "Storage uploads add scalable asset-handling expertise."
} /* 18 – Security Rules Basics */, {
  monetaryValue: 112000,
  "swift-en": "Security-rules insight protects data at enterprise scale."
} /* 19 – Performance Monitoring */, {
  monetaryValue: 115000,
  "swift-en": "Monitoring skills drive performance-optimization value."
} /* 20 – Popular Firebase Extensions */, {
  monetaryValue: 118000,
  "swift-en": "Extension know-how accelerates feature delivery."
} /* 21 – Review With AI Conversation (optional) */, {
  monetaryValue: 120000,
  "swift-en": "Comprehensive review crowns you at senior iOS tier."
}];

/* ---------- Android Tutorial loot meter ---------- */
export const androidLoot = [{},
// 0 – Introduction placeholder (no monetary gain yet)

// 1 – Understanding Coding
{
  monetaryValue: 0,
  "android-en": "Pure theory—no immediate billable skill."
},
// 2 – Sequence of Program Execution
{
  monetaryValue: 0,
  "android-en": "Execution-flow insight is still unpaid groundwork."
},
// 3 – Introduction to Variables
{
  monetaryValue: 125,
  "android-en": "Variable basics open tiny scripting gigs (~$125)."
},
// 4 – Understanding List Declarations
{
  monetaryValue: 250,
  "android-en": "Array/List handling enables simple automation tasks."
},
// 5 – Variable Assignment in Java
{
  monetaryValue: 250,
  "android-en": "Confident assignment lets you tweak configs safely."
},
// 6 – Understanding Data Types
{
  monetaryValue: 300,
  "android-en": "Type awareness prevents bugs—marketable skill bump."
},
// 7 – Purpose of Variables
{
  monetaryValue: 300,
  "android-en": "Explaining variable intent shows code clarity to employers."
},
// 8 – Bash Terminal Practice: cd
{
  monetaryValue: 375,
  "android-en": "CLI navigation preps you for junior DevOps chores."
},
// 9 – Review With AI Conversation (optional)
{
  monetaryValue: 375,
  "android-en": "Conversation recap cements knowledge—earnings hold steady."
} /* 1 – Data Types in Programming */, {
  monetaryValue: 375,
  "android-en": "Primitive-type fluency lands basic data-cleanup gigs."
} /* 2 – Steps to Create a Function */, {
  monetaryValue: 425,
  "android-en": "Method workflow qualifies you for tiny utility scripts."
} /* 3 – Writing a Simple Function */, {
  monetaryValue: 500,
  "android-en": "Authoring methods opens low-stakes automation work."
} /* 4 – Functions in Programming (concept) */, {
  monetaryValue: 500,
  "android-en": "Explaining methods shows architectural awareness."
} /* 5 – Conditional Statements */, {
  monetaryValue: 625,
  "android-en": "Branching logic unlocks decision-making code tasks."
} /* 6 – Order of Conditional Checks */, {
  monetaryValue: 750,
  "android-en": "Flow-control precision reduces QA time for small apps."
} /* 7 – Implementing Conditional Logic */, {
  monetaryValue: 875,
  "android-en": "Hands-on conditionals prove practical coding ability."
} /* 8 – Logical Operator (single-line answer) */, {
  monetaryValue: 1000,
  "android-en": "Operator insight tightens code correctness."
} /* 9 – Real-world Use of Conditionals */, {
  monetaryValue: 1000,
  "android-en": "Applying conditionals to business logic adds value."
} /* 10 – Terminal Practice: help */, {
  monetaryValue: 1125,
  "android-en": "CLI help skills prep you for DevOps workflows."
} /* 11 – Loops in Programming */, {
  monetaryValue: 1250,
  "android-en": "Loop mastery automates repetitive data tasks."
} /* 12 – Sequence of Loop Execution */, {
  monetaryValue: 1375,
  "android-en": "Understanding loop order trims runtime errors."
} /* 13 – Creating a Loop (code) */, {
  monetaryValue: 1500,
  "android-en": "Writing loops nets entry-level data-wrangling jobs."
} /* 14 – Applications of Loops */, {
  monetaryValue: 1500,
  "android-en": "Articulating loop use cases shows system thinking."
} /* 15 – Arrays in Java (methods quiz) */, {
  monetaryValue: 1625,
  "android-en": "Array utilities speed up ETL and tooling."
} /* 16 – Order of Array Operations */, {
  monetaryValue: 1750,
  "android-en": "Sequencing array ops improves data-pipeline quality."
} /* 17 – Manipulating Arrays (code) */, {
  monetaryValue: 1875,
  "android-en": "Fluent array manipulation boosts productivity rates."
} /* 18 – Use Cases for Arrays (text) */, {
  monetaryValue: 1875,
  "android-en": "Mapping array use cases to apps signals insight."
} /* 19 – Terminal Practice: mkdir */, {
  monetaryValue: 2000,
  "android-en": "Directory commands add build-script credibility."
} /* 20 – Advanced Coding Output */, {
  monetaryValue: 2250,
  "android-en": "Predicting complex output shows mental-model mastery."
} /* 21 – Review With AI Conversation (optional) */, {
  monetaryValue: 2250,
  "android-en": "AI recap consolidates gains—value steadies here."
} /* 1 – Introduction to Objects */, {
  monetaryValue: 2500,
  "android-en": "Object basics spark entry-level MVC maintenance gigs."
} /* 2 – Understanding the Constructor Method */, {
  monetaryValue: 3750,
  "android-en": "Constructor mastery scaffolds clean, reusable classes."
} /* 3 – Purpose of the Constructor Method */, {
  monetaryValue: 3875,
  "android-en": "Explaining constructors shows design-pattern awareness."
} /* 4 – Creating an Instance of a Class */, {
  monetaryValue: 4250,
  "android-en": "Instantiating objects enables model-layer tasks."
} /* 5 – Declaring a Method in a Class */, {
  monetaryValue: 4500,
  "android-en": "Custom methods demonstrate behavior encapsulation."
} /* 6 – Using the this Keyword Correctly */, {
  monetaryValue: 4625,
  "android-en": "Proper use of this signals context mastery."
} /* 7 – Adding Properties to an Object */, {
  monetaryValue: 4750,
  "android-en": "Property modeling improves data flexibility."
} /* 8 – Accessing & Modifying Object Properties */, {
  monetaryValue: 4875,
  "android-en": "Safe property access reduces runtime errors."
} /* 9 – Modifying Object Properties */, {
  monetaryValue: 5000,
  "android-en": "Dynamic updates unlock CRUD feature work."
} /* 10 – Understanding Inheritance */, {
  monetaryValue: 6000,
  "android-en": "Inheritance insight opens framework customization."
} /* 11 – Implementing Inheritance */, {
  monetaryValue: 6750,
  "android-en": "Subclassing skills qualify you for SDK extensions."
} /* 12 – Overriding Methods */, {
  monetaryValue: 7500,
  "android-en": "Polymorphic overrides elevate junior-dev salaries."
} /* 13 – Understanding Encapsulation */, {
  monetaryValue: 7625,
  "android-en": "Encapsulation theory guards state integrity."
} /* 14 – Implementing Encapsulation */, {
  monetaryValue: 8250,
  "android-en": "Getters/setters show production-ready design."
} /* 15 – Encapsulation Concept (one-word recall) */, {
  monetaryValue: 8250,
  "android-en": "Term recall keeps value steady here."
} /* 16 – Combining Concepts Mini-Project */, {
  monetaryValue: 9500,
  "android-en": "Capstone OOP project proves deliverable-ready skills."
} /* 17 – Printing in the Terminal */, {
  monetaryValue: 9500,
  "android-en": "Shell output reinforces fundamentals—value holds."
} /* 18 – Review With AI Conversation (optional) */, {
  monetaryValue: 9500,
  "android-en": "AI recap solidifies OOP foundation—earnings level off."
}, {
  monetaryValue: 20000,
  "android-en": "View fundamentals unlock modern Android UI gigs."
} /* 2 – Key Concepts in Android UI */, {
  monetaryValue: 21000,
  "android-en": "Activity + Fragment mastery boosts architecture value."
} /* 3 – Effect of LiveData Changes on UI */, {
  monetaryValue: 22000,
  "android-en": "Reactive updates mark you as MVVM-ready."
} /* 4 – Creating a Simple Activity */, {
  monetaryValue: 23000,
  "android-en": "Hands-on Activity building shows deliverable skills."
} /* 5 – Handling Button Clicks */, {
  monetaryValue: 24000,
  "android-en": "Click listeners demonstrate interactive chops."
} /* 6 – Managing State with ViewModel */, {
  monetaryValue: 25000,
  "android-en": "ViewModel + LiveData qualify you for junior Android roles."
} /* 7 – Intent Extras */, {
  monetaryValue: 26000,
  "android-en": "Intent data-passing enhances component reuse."
} /* 8 – Passing and Using Extras */, {
  monetaryValue: 27000,
  "android-en": "Dynamic extras sharpen navigation architecture."
} /* 9 – Props vs State in Android */, {
  monetaryValue: 28000,
  "android-en": "Distinguishing extras vs LiveData shows design maturity."
} /* 10 – Terminal Practice: ls */, {
  monetaryValue: 29000,
  "android-en": "CLI file ops prep build-workflow automation."
} /* 11 – Styling Android Views */, {
  monetaryValue: 30000,
  "android-en": "XML styling proves product-ready polish."
} /* 12 – ConstraintLayout Basics */, {
  monetaryValue: 31000,
  "android-en": "ConstraintLayout fluency speeds responsive design."
} /* 13 – Sharing ViewModel Between Fragments */, {
  monetaryValue: 32000,
  "android-en": "Shared state enables multi-fragment orchestration."
} /* 14 – Observing LiveData for Side Effects */, {
  monetaryValue: 33000,
  "android-en": "Lifecycle hooks signal side-effect competence."
} /* 15 – Understanding Activity Lifecycle */, {
  monetaryValue: 34000,
  "android-en": "Lifecycle insight supports performance tuning."
} /* 16 – Fetching Data with Retrofit & LiveData */, {
  monetaryValue: 35000,
  "android-en": "Async Retrofit calls show API-integration skill."
} /* 17 – Building a Complete Tweet App */, {
  monetaryValue: 37500,
  "android-en": "End-to-end app showcases full-stack delivery."
} /* 18 – Terminal Practice: Gradle build */, {
  monetaryValue: 40000,
  "android-en": "Gradle CLI workflow demonstrates dev-env autonomy."
} /* 19 – Creating a New Android Project */, {
  monetaryValue: 42500,
  "android-en": "Android-Studio setup accelerates shipping velocity."
} /* 20 – Review With AI Conversation (optional) */, {
  monetaryValue: 45000,
  "android-en": "Comprehensive review cements senior-track value."
} /* 1 – Intro to Java Backend Engineering */, {
  monetaryValue: 46000,
  "android-en": "Backend basics introduce server-side logic know-how."
} /* 2 – Main Lessons Overview (core duty) */, {
  monetaryValue: 48000,
  "android-en": "Spotting core duties sharpens your employment roadmap."
} /* 3 – Key Responsibilities of Backend Engineering */, {
  monetaryValue: 50000,
  "android-en": "Multi-responsibility insight boosts junior-dev readiness."
} /* 4 – Interfacing with the Terminal */, {
  monetaryValue: 51000,
  "android-en": "Terminal fluency powers everyday backend tasks."
} /* 5 – Installing Maven */, {
  monetaryValue: 52000,
  "android-en": "Maven install shows dependency-management confidence."
} /* 6 – Adding a Maven Dependency */, {
  monetaryValue: 53000,
  "android-en": "POM wiring proves build-tool mastery."
} /* 7 – User Creation & Authentication (concept) */, {
  monetaryValue: 54000,
  "android-en": "Auth terminology safeguards future user data."
} /* 8 – Database Foundations */, {
  monetaryValue: 55000,
  "android-en": "DB-type literacy guides sound architecture choices."
} /* 9 – Connecting to DB with Spring Data JPA */, {
  monetaryValue: 56000,
  "android-en": "PostgreSQL hookup skills impress hiring managers."
} /*10 – Initiating a Spring Boot Project */, {
  monetaryValue: 57000,
  "android-en": "Project bootstrap showcases rapid API setup."
} /*11 – Advanced Data-Storage Practices */, {
  monetaryValue: 59000,
  "android-en": "Storage best-practices prove reliability mindset."
} /*12 – Configuring JPA & Saving Entity */, {
  monetaryValue: 61000,
  "android-en": "JPA CRUD shows ORM proficiency in action."
} /*13 – Handling User Data */, {
  monetaryValue: 62000,
  "android-en": "User-lookup code demonstrates practical DB use."
} /*14 – Retrieving User After Authentication */, {
  monetaryValue: 63000,
  "android-en": "Secure queries highlight credential-handling care."
} /*15 – Understanding the Authentication Flow */, {
  monetaryValue: 64000,
  "android-en": "JWT flow maps modern authentication pipelines."
} /*16 – OAuth Authentication */, {
  monetaryValue: 65000,
  "android-en": "OAuth know-how enables third-party sign-ins."
} /*17 – Using Environment Variables */, {
  monetaryValue: 66000,
  "android-en": "Environment vars keep secrets safe in code."
} /*18 – Database Relationships with JPA */, {
  monetaryValue: 67000,
  "android-en": "Entity relationships design scalable schemas."
} /*19 – Interfacing with an API */, {
  monetaryValue: 68000,
  "android-en": "REST method insight preps you for API work."
} /*20 – Creating a JWT Auth System */, {
  monetaryValue: 69000,
  "android-en": "Building JWT security shows end-to-end chops."
} /*21 – Deploying Spring Boot App */, {
  monetaryValue: 70000,
  "android-en": "Production deployment caps senior-track salary bands."
} /*22 – Review With AI Conversation (optional) */, {
  monetaryValue: 70000,
  "android-en": "AI recap locks in knowledge—value plateaus here."
} /* 1 – Benefits of Serverless Cloud Platforms */, {
  monetaryValue: 75000,
  "android-en": "Serverless savvy raises your market ceiling instantly."
} /* 2 – Understanding Android Studio */, {
  monetaryValue: 76000,
  "android-en": "Studio mastery speeds day-one productivity on Android teams."
} /* 3 – Installing JDK & Android SDK */, {
  monetaryValue: 77000,
  "android-en": "Proper tool-chain setup unlocks cross-stack development."
} /* 4 – Adding Firebase to Gradle */, {
  monetaryValue: 78000,
  "android-en": "Gradle BOM wiring proves build-script competence."
} /* 5 – Applying Google Services Plugin */, {
  monetaryValue: 79000,
  "android-en": "Plugin config shows dependency-injection confidence."
} /* 6 – Initializing a Firebase Project */, {
  monetaryValue: 81000,
  "android-en": "google-services.json onboarding shows cloud bootstrap skill."
} /* 7 – Selecting Firebase Modules */, {
  monetaryValue: 83000,
  "android-en": "Service selection reveals solution-architecture judgment."
} /* 8 – Configuring FirebaseApp */, {
  monetaryValue: 86000,
  "android-en": "Runtime init signals secure SDK integration."
} /* 9 – Setting Up Firestore */, {
  monetaryValue: 88000,
  "android-en": "Firestore setup proves NoSQL data-layer chops."
} /* 10 – Understanding Authentication */, {
  monetaryValue: 90000,
  "android-en": "Auth concepts mark you as user-management capable."
} /* 11 – Creating a User with FirebaseAuth */, {
  monetaryValue: 92000,
  "android-en": "Programmatic sign-up enables SaaS onboarding flows."
} /* 12 – Retrieving the ID Token */, {
  monetaryValue: 94000,
  "android-en": "ID-token handling shows secure session logic."
} /* 13 – CRUD with Firestore */, {
  monetaryValue: 97000,
  "android-en": "CRUD mastery enables full data-layer ownership."
} /* 14 – Calling Cloud Functions */, {
  monetaryValue: 100000,
  "android-en": "Function calls push you into six-figure territory."
} /* 15 – Local Emulation */, {
  monetaryValue: 103000,
  "android-en": "Emulator workflow shortens dev cycles—high ROI for teams."
} /* 16 – Deploying to Firebase */, {
  monetaryValue: 108000,
  "android-en": "Production deploy proficiency justifies senior rates."
} /* 17 – Uploading to Storage */, {
  monetaryValue: 110000,
  "android-en": "Storage uploads add scalable asset-handling expertise."
} /* 18 – Security Rules Basics */, {
  monetaryValue: 112000,
  "android-en": "Security-rules insight protects data at enterprise scale."
} /* 19 – Performance Monitoring */, {
  monetaryValue: 115000,
  "android-en": "Monitoring skills drive performance-optimization value."
} /* 20 – Popular Firebase Extensions */, {
  monetaryValue: 118000,
  "android-en": "Extension know-how accelerates feature delivery."
} /* 21 – Review With AI Conversation (optional) */, {
  monetaryValue: 120000,
  "android-en": "Comprehensive review crowns you at senior Android tier."
}];
export let buildSuperLoot = () => {
  const maxLen = Math.max(loot.length
  // pythonLoot.length,
  // androidLoot.length,
  // swiftLoot.length
  );
  const superLoot = [];
  for (let i = 0; i < maxLen; i++) {
    // base object with all expected keys
    const entry = {
      monetaryValue: 0,
      en: "",
      es: "",
      "python-en": "",
      "android-en": "",
      "swift-en": ""
    };

    /* ------------------------  LOOT  ------------------------ */
    if (loot[i]) {
      entry.monetaryValue = loot[i].monetaryValue ?? 0;
      entry.en = loot[i].en ?? "";
      entry.es = loot[i].es ?? "";
    }

    /* ----------------------  PYTHON  ------------------------ */
    // if (pythonLoot[i]) {
    //   entry["python-en"] = pythonLoot[i]["py-en"] ?? "";
    //   // if the base loot row was empty, use python’s money
    //   entry.monetaryValue = Math.max(
    //     entry.monetaryValue,
    //     pythonLoot[i].monetaryValue ?? 0
    //   );
    // }

    /* ---------------------  ANDROID  ------------------------ */
    // if (androidLoot[i]) {
    //   entry["android-en"] = androidLoot[i]["android-en"] ?? "";
    //   entry.monetaryValue = Math.max(
    //     entry.monetaryValue,
    //     androidLoot[i].monetaryValue ?? 0
    //   );
    // }

    /* -----------------------  SWIFT  ------------------------ */
    // if (swiftLoot[i]) {
    //   entry["swift-en"] = swiftLoot[i]["swift-en"] ?? "";
    //   entry.monetaryValue = Math.max(
    //     entry.monetaryValue,
    //     swiftLoot[i].monetaryValue ?? 0
    //   );
    // }

    superLoot.push(entry);
  }
  return superLoot;
};
export const lectureSummaries = {
  en: {
    tutorial: {
      videoSrc: "",
      //string url
      content: <div>Hello world</div>,
      //jsx
      challengeQuestion: ""
    },
    1: {},
    2: {},
    3: {},
    4: {},
    5: {},
    6: {}
  },
  es: {
    tutorial: {},
    1: {},
    2: {},
    3: {},
    4: {},
    5: {},
    6: {}
  },
  "py-en": {
    tutorial: {
      videoSrc: "",
      //string url
      content: <div>Hello world</div>,
      //jsx
      challengeQuestion: ""
    },
    1: {},
    2: {},
    3: {},
    4: {},
    5: {},
    6: {}
  },
  "swift-end": {
    tutorial: {
      videoSrc: "",
      //string url
      content: <div>Hello world</div>,
      //jsx
      challengeQuestion: ""
    },
    1: {},
    2: {},
    3: {},
    4: {},
    5: {},
    6: {}
  },
  "android-en": {
    tutorial: {
      videoSrc: "",
      //string url
      content: <div>Hello world</div>,
      //jsx
      challengeQuestion: ""
    },
    1: {},
    2: {},
    3: {},
    4: {},
    5: {},
    6: {}
  },
  "compsci-en": {
    tutorial: {
      videoSrc: "",
      //string url
      content: <div>Hello world</div>,
      //jsx
      challengeQuestion: ""
    },
    1: {},
    2: {},
    3: {},
    4: {},
    5: {},
    6: {}
  }
};
export const generatedSteps = [];
export const celebrationMessages = {
  en: ["You're doing amazing! 🎉✨", "Fantastic job! Keep it up! 🚀🎈", "You're crushing it! 💪😄", "Awesome work! 👏🥳", "Impressive progress! 🌠🙌", "Way to go! 🥳🔥", "Outstanding performance! 🥇👏", "You're incredible! 🤩✨", "Keep up the fantastic work! 🎈🙌", "You've got this! 💪🎉", "Bravo! 👏🎊", "So proud of you! 🌟😊", "Keep up the amazing effort! 🙌🔥", "You're a total champion! 🏆😄", "Great job, keep rocking! 🤘🎉", "You're unstoppable today! 🚀💥", "Absolutely fantastic! 🌟🎉", "You're making waves! 🌊😄", "Keep being awesome! 😎✨", "Epic job! 🚀🥳", "You're flying high! ✈️😊", "Outstanding job! 🌟🎈", "You nailed it! 🎯😄", "Keep soaring! 🦅✨", "You're incredible! 🤩🙌", "You're on fire! 🔥🥳", "Amazing job, keep it up! 🚀😄", "You're thriving! 🌱😊", "Extraordinary effort! 🎖️👏", "Keep shining bright! ✨😄", "Magnificent performance! 🌟🙌", "You're unstoppable! 🚀💪", "You're a powerhouse! 💥🥳", "You're a true superstar! 🤩🌟", "Epic performance! 🚀🎉", "You're doing wonderfully! 😊👏", "Great momentum! Keep it going! 🌟🚀", "Keep dazzling! ✨😄", "You're making magic happen! ✨🪄", "You're unstoppable! 🚀🔥", "Incredible progress! 🙌😄", "You're phenomenal! 🌟🥳", "Keep shining bright! ✨🌞", "You're slaying! 🔥👏", "You're positively radiant! 😊✨", "You're unstoppable today! 🚀🎊", "Outstanding performance! 👏😊", "Keep being fabulous! 🌟🎈", "You're rocking this! 🎸🥳", "You're amazing! Keep going! 🌟✨", "You're absolutely brilliant! 💡🎉", "Keep conquering! 🏅🚀", "Fantastic work! Keep soaring! ✈️🌟", "You're truly impressive! 👏✨", "You're extraordinary! 🌟😊", "Great job! Keep thriving! 🌱🎉", "You're exceptional! 🎉🌟", "Keep up the awesome work! 🙌🥳", "You're fantastic! ✨😄", "You're truly inspirational! 🌈👏", "You're absolutely smashing it! 🚀💥", "You're outstanding! 🌟🎉", "Keep making us proud! 😊🙌", "You're truly unstoppable! 🚀🎈", "You're amazing! Keep pushing! 💪🥳", "You're a legend! 🏅😄", "Keep lighting it up! 🔥✨", "You're doing incredible! 🎉👏", "You're truly spectacular! 🌠😊", "Keep it going! You're doing great! 💪✨", "You're wonderful! 🌟😄", "You're unstoppable brilliance! 🚀✨", "You're absolutely rocking it! 🎸😊", "Keep reaching new heights! 🏔️🎉", "You're superb! ✨🙌", "You're on a fantastic roll! 🎲🥳", "Keep crushing those goals! 🎯😄", "You're brilliant! 💡✨", "You're fantastic beyond words! 🎉👏", "You're totally rocking it! 🤘😎", "Keep it up, superstar! 🌟😊", "You're shining bright today! ✨😄", "Keep smashing it! 🚀💥", "You're truly unstoppable! 🚀🎊", "Outstanding effort! 🎖️✨", "You're awesome, keep it going! 🎉😄", "Keep breaking barriers! 🚧💪", "You're extraordinary every day! 🎉😊", "Keep achieving greatness! 🏆✨", "You're a shining example! ✨😊", "You're a total winner! 🏅😄", "Keep shining, you're amazing! ✨🌞", "You're absolutely crushing it! 💪🔥", "You're fantastic today! 🎉😄", "Keep the greatness coming! 🚀✨", "You're inspirational! 🌈😊", "You're lighting it up! 🔥🎈", "Keep soaring high! 🦅✨", "You're doing an awesome job! 🎉😊", "You're unstoppable greatness! 🚀🌟", "Keep going strong! 💪😄", "You're absolutely remarkable! 🎖️✨", "Keep being amazing! 🌟😊", "You're thriving wonderfully! 🌱🎉", "You're absolutely incredible! 🌠😄", "Keep shining! ✨🎈", "You're exceptional! 🌟👏", "You're unstoppable brilliance today! 🚀😄", "Keep up the excellent work! 🎉🙌", "You're extraordinary! Keep going! 🌟😊", "Keep pushing forward! 🚀🎉", "You're making fantastic progress! 🎈😊", "You're an absolute champion! 🏆😄", "Keep slaying your goals! 🔥👏", "You're fantastic! Keep going strong! 🎉💪", "You're totally impressive! 🌟😄", "Keep rocking! 🎸✨", "You're absolutely magnificent! 🎉🌟", "You're on a roll! Keep it up! 🎲😄", "You're exceptional today! 🎉👏", "Keep shining brightly! ✨😊", "You're totally unstoppable! 🚀🥳", "You're thriving and inspiring! 🌱😊", "Keep excelling! 🎖️😄", "You're doing wonderfully today! 🌟🎉", "You're making it happen! 🚀✨", "Keep being unstoppable! 🔥💪", "You're spectacular! 🎉🌠", "Keep achieving greatness! 🏆✨", "You're positively radiant today! 😊✨", "Keep being fantastic! 🌟😄", "You're crushing everything! 💥💪", "Keep up the amazing work! 🎉🙌", "You're totally epic! 🚀😄", "You're remarkable! 🌟👏", "Keep shining, you're a star! ✨😊", "You're truly magnificent! 🎉😄", "You're on fire! 🔥🚀", "Keep being incredible! 🌟😄", "You're unstoppable today! 🚀✨"],
  es: ["¡Lo estás haciendo increíble! 🎉✨", "¡Trabajo fantástico! ¡Sigue así! 🚀🎈", "¡Lo estás arrasando! 💪😄", "¡Excelente trabajo! 👏🥳", "¡Progreso impresionante! 🌠🙌", "¡Así se hace! 🥳🔥", "¡Actuación sobresaliente! 🥇👏", "¡Eres increíble! 🤩✨", "¡Sigue con el fantástico trabajo! 🎈🙌", "¡Tú puedes hacerlo! 💪🎉", "¡Bravo! 👏🎊", "¡Muy orgulloso de ti! 🌟😊", "¡Continúa con ese esfuerzo increíble! 🙌🔥", "¡Eres todo un campeón! 🏆😄", "¡Gran trabajo, sigue así! 🤘🎉", "¡Hoy eres imparable! 🚀💥", "¡Absolutamente fantástico! 🌟🎉", "¡Estás causando sensación! 🌊😄", "¡Sigue siendo increíble! 😎✨", "¡Trabajo épico! 🚀🥳", "¡Estás volando alto! ✈️😊", "¡Trabajo sobresaliente! 🌟🎈", "¡Lo clavaste! 🎯😄", "¡Sigue volando alto! 🦅✨", "¡Eres increíble! 🤩🙌", "¡Estás que ardes! 🔥🥳", "¡Trabajo increíble, sigue así! 🚀😄", "¡Estás floreciendo! 🌱😊", "¡Esfuerzo extraordinario! 🎖️👏", "¡Sigue brillando fuerte! ✨😄", "¡Actuación magnífica! 🌟🙌", "¡Eres imparable! 🚀💪", "¡Eres una fuerza imparable! 💥🥳", "¡Eres una verdadera estrella! 🤩🌟", "¡Actuación épica! 🚀🎉", "¡Lo estás haciendo maravillosamente! 😊👏", "¡Gran impulso! ¡Sigue adelante! 🌟🚀", "¡Sigue deslumbrando! ✨😄", "¡Estás haciendo magia! ✨🪄", "¡Eres imparable! 🚀🔥", "¡Progreso increíble! 🙌😄", "¡Eres fenomenal! 🌟🥳", "¡Sigue brillando! ✨🌞", "¡Estás arrasando! 🔥👏", "¡Estás radiante! 😊✨", "¡Hoy eres imparable! 🚀🎊", "¡Actuación excepcional! 👏😊", "¡Sigue siendo fabuloso! 🌟🎈", "¡Lo estás rockeando! 🎸🥳", "¡Eres increíble! ¡Sigue adelante! 🌟✨", "¡Eres absolutamente brillante! 💡🎉", "¡Sigue conquistando! 🏅🚀", "¡Trabajo fantástico! ¡Sigue volando alto! ✈️🌟", "¡Eres realmente impresionante! 👏✨", "¡Eres extraordinario! 🌟😊", "¡Gran trabajo! ¡Sigue floreciendo! 🌱🎉", "¡Eres excepcional! 🎉🌟", "¡Continúa con el excelente trabajo! 🙌🥳", "¡Eres fantástico! ✨😄", "¡Eres verdaderamente inspirador! 🌈👏", "¡Lo estás destrozando absolutamente! 🚀💥", "¡Eres sobresaliente! 🌟🎉", "¡Sigue haciéndonos sentir orgullosos! 😊🙌", "¡Eres verdaderamente imparable! 🚀🎈", "¡Eres increíble! ¡Sigue empujando! 💪🥳", "¡Eres una leyenda! 🏅😄", "¡Sigue encendiéndolo todo! 🔥✨", "¡Estás increíble! 🎉👏", "¡Eres realmente espectacular! 🌠😊", "¡Sigue así! ¡Lo estás haciendo genial! 💪✨", "¡Eres maravilloso! 🌟😄", "¡Tu brillantez es imparable! 🚀✨", "¡Lo estás haciendo genial! 🎸😊", "¡Sigue alcanzando nuevas alturas! 🏔️🎉", "¡Eres magnífico! ✨🙌", "¡Estás en una racha fantástica! 🎲🥳", "¡Sigue alcanzando esas metas! 🎯😄", "¡Eres brillante! 💡✨", "¡Eres fantástico más allá de las palabras! 🎉👏", "¡Lo estás rockeando totalmente! 🤘😎", "¡Sigue así, superestrella! 🌟😊", "¡Estás brillando hoy! ✨😄", "¡Sigue rompiéndola! 🚀💥", "¡Eres realmente imparable! 🚀🎊", "¡Esfuerzo sobresaliente! 🎖️✨", "¡Eres increíble, sigue así! 🎉😄", "¡Sigue rompiendo barreras! 🚧💪", "¡Eres extraordinario cada día! 🎉😊", "¡Sigue alcanzando grandeza! 🏆✨", "¡Eres un ejemplo brillante! ✨😊", "¡Eres un verdadero ganador! 🏅😄", "¡Sigue brillando, eres increíble! ✨🌞", "¡Lo estás haciendo genial! 💪🔥", "¡Hoy estás fantástico! 🎉😄", "¡Continúa con tu grandeza! 🚀✨", "¡Eres una inspiración! 🌈😊", "¡Estás encendiéndolo todo! 🔥🎈", "¡Sigue volando alto! 🦅✨", "¡Estás haciendo un trabajo increíble! 🎉😊", "¡Tu grandeza es imparable! 🚀🌟", "¡Sigue fuerte! 💪😄", "¡Eres absolutamente notable! 🎖️✨", "¡Sigue siendo increíble! 🌟😊", "¡Estás floreciendo maravillosamente! 🌱🎉", "¡Eres absolutamente increíble! 🌠😄", "¡Sigue brillando! ✨🎈", "¡Eres excepcional! 🌟👏", "¡Tu brillantez hoy es imparable! 🚀😄", "¡Continúa con el excelente trabajo! 🎉🙌", "¡Eres extraordinario! ¡Sigue adelante! 🌟😊", "¡Sigue avanzando! 🚀🎉", "¡Estás progresando fantásticamente! 🎈😊", "¡Eres un campeón absoluto! 🏆😄", "¡Sigue logrando tus objetivos! 🔥👏", "¡Eres fantástico! ¡Sigue fuerte! 🎉💪", "¡Eres totalmente impresionante! 🌟😄", "¡Sigue rockeando! 🎸✨", "¡Eres absolutamente magnífico! 🎉🌟", "¡Estás en racha! ¡Sigue así! 🎲😄", "¡Eres excepcional hoy! 🎉👏", "¡Sigue brillando intensamente! ✨😊", "¡Eres totalmente imparable! 🚀🥳", "¡Estás floreciendo e inspirando! 🌱😊", "¡Sigue sobresaliendo! 🎖️😄", "¡Hoy lo estás haciendo maravillosamente! 🌟🎉", "¡Estás haciéndolo realidad! 🚀✨", "¡Sigue siendo imparable! 🔥💪", "¡Eres espectacular! 🎉🌠", "¡Sigue alcanzando grandeza! 🏆✨", "¡Hoy estás radiante! 😊✨", "¡Sigue siendo fantástico! 🌟😄", "¡Estás arrasando con todo! 💥💪", "¡Continúa con el increíble trabajo! 🎉🙌", "¡Eres totalmente épico! 🚀😄", "¡Eres notable! 🌟👏", "¡Sigue brillando, eres una estrella! ✨😊", "¡Eres realmente magnífico! 🎉😄", "¡Estás que ardes! 🔥🚀", "¡Sigue siendo increíble! 🌟😄", "¡Hoy eres imparable! 🚀✨"],
  "py-en": ["You're doing amazing! 🎉✨", "Fantastic job! Keep it up! 🚀🎈", "You're crushing it! 💪😄", "Awesome work! 👏🥳", "Impressive progress! 🌠🙌", "Way to go! 🥳🔥", "Outstanding performance! 🥇👏", "You're incredible! 🤩✨", "Keep up the fantastic work! 🎈🙌", "You've got this! 💪🎉", "Bravo! 👏🎊", "So proud of you! 🌟😊", "Keep up the amazing effort! 🙌🔥", "You're a total champion! 🏆😄", "Great job, keep rocking! 🤘🎉", "You're unstoppable today! 🚀💥", "Absolutely fantastic! 🌟🎉", "You're making waves! 🌊😄", "Keep being awesome! 😎✨", "Epic job! 🚀🥳", "You're flying high! ✈️😊", "Outstanding job! 🌟🎈", "You nailed it! 🎯😄", "Keep soaring! 🦅✨", "You're incredible! 🤩🙌", "You're on fire! 🔥🥳", "Amazing job, keep it up! 🚀😄", "You're thriving! 🌱😊", "Extraordinary effort! 🎖️👏", "Keep shining bright! ✨😄", "Magnificent performance! 🌟🙌", "You're unstoppable! 🚀💪", "You're a powerhouse! 💥🥳", "You're a true superstar! 🤩🌟", "Epic performance! 🚀🎉", "You're doing wonderfully! 😊👏", "Great momentum! Keep it going! 🌟🚀", "Keep dazzling! ✨😄", "You're making magic happen! ✨🪄", "You're unstoppable! 🚀🔥", "Incredible progress! 🙌😄", "You're phenomenal! 🌟🥳", "Keep shining bright! ✨🌞", "You're slaying! 🔥👏", "You're positively radiant! 😊✨", "You're unstoppable today! 🚀🎊", "Outstanding performance! 👏😊", "Keep being fabulous! 🌟🎈", "You're rocking this! 🎸🥳", "You're amazing! Keep going! 🌟✨", "You're absolutely brilliant! 💡🎉", "Keep conquering! 🏅🚀", "Fantastic work! Keep soaring! ✈️🌟", "You're truly impressive! 👏✨", "You're extraordinary! 🌟😊", "Great job! Keep thriving! 🌱🎉", "You're exceptional! 🎉🌟", "Keep up the awesome work! 🙌🥳", "You're fantastic! ✨😄", "You're truly inspirational! 🌈👏", "You're absolutely smashing it! 🚀💥", "You're outstanding! 🌟🎉", "Keep making us proud! 😊🙌", "You're truly unstoppable! 🚀🎈", "You're amazing! Keep pushing! 💪🥳", "You're a legend! 🏅😄", "Keep lighting it up! 🔥✨", "You're doing incredible! 🎉👏", "You're truly spectacular! 🌠😊", "Keep it going! You're doing great! 💪✨", "You're wonderful! 🌟😄", "You're unstoppable brilliance! 🚀✨", "You're absolutely rocking it! 🎸😊", "Keep reaching new heights! 🏔️🎉", "You're superb! ✨🙌", "You're on a fantastic roll! 🎲🥳", "Keep crushing those goals! 🎯😄", "You're brilliant! 💡✨", "You're fantastic beyond words! 🎉👏", "You're totally rocking it! 🤘😎", "Keep it up, superstar! 🌟😊", "You're shining bright today! ✨😄", "Keep smashing it! 🚀💥", "You're truly unstoppable! 🚀🎊", "Outstanding effort! 🎖️✨", "You're awesome, keep it going! 🎉😄", "Keep breaking barriers! 🚧💪", "You're extraordinary every day! 🎉😊", "Keep achieving greatness! 🏆✨", "You're a shining example! ✨😊", "You're a total winner! 🏅😄", "Keep shining, you're amazing! ✨🌞", "You're absolutely crushing it! 💪🔥", "You're fantastic today! 🎉😄", "Keep the greatness coming! 🚀✨", "You're inspirational! 🌈😊", "You're lighting it up! 🔥🎈", "Keep soaring high! 🦅✨", "You're doing an awesome job! 🎉😊", "You're unstoppable greatness! 🚀🌟", "Keep going strong! 💪😄", "You're absolutely remarkable! 🎖️✨", "Keep being amazing! 🌟😊", "You're thriving wonderfully! 🌱🎉", "You're absolutely incredible! 🌠😄", "Keep shining! ✨🎈", "You're exceptional! 🌟👏", "You're unstoppable brilliance today! 🚀😄", "Keep up the excellent work! 🎉🙌", "You're extraordinary! Keep going! 🌟😊", "Keep pushing forward! 🚀🎉", "You're making fantastic progress! 🎈😊", "You're an absolute champion! 🏆😄", "Keep slaying your goals! 🔥👏", "You're fantastic! Keep going strong! 🎉💪", "You're totally impressive! 🌟😄", "Keep rocking! 🎸✨", "You're absolutely magnificent! 🎉🌟", "You're on a roll! Keep it up! 🎲😄", "You're exceptional today! 🎉👏", "Keep shining brightly! ✨😊", "You're totally unstoppable! 🚀🥳", "You're thriving and inspiring! 🌱😊", "Keep excelling! 🎖️😄", "You're doing wonderfully today! 🌟🎉", "You're making it happen! 🚀✨", "Keep being unstoppable! 🔥💪", "You're spectacular! 🎉🌠", "Keep achieving greatness! 🏆✨", "You're positively radiant today! 😊✨", "Keep being fantastic! 🌟😄", "You're crushing everything! 💥💪", "Keep up the amazing work! 🎉🙌", "You're totally epic! 🚀😄", "You're remarkable! 🌟👏", "Keep shining, you're a star! ✨😊", "You're truly magnificent! 🎉😄", "You're on fire! 🔥🚀", "Keep being incredible! 🌟😄", "You're unstoppable today! 🚀✨"],
  "swift-en": ["You're doing amazing! 🎉✨", "Fantastic job! Keep it up! 🚀🎈", "You're crushing it! 💪😄", "Awesome work! 👏🥳", "Impressive progress! 🌠🙌", "Way to go! 🥳🔥", "Outstanding performance! 🥇👏", "You're incredible! 🤩✨", "Keep up the fantastic work! 🎈🙌", "You've got this! 💪🎉", "Bravo! 👏🎊", "So proud of you! 🌟😊", "Keep up the amazing effort! 🙌🔥", "You're a total champion! 🏆😄", "Great job, keep rocking! 🤘🎉", "You're unstoppable today! 🚀💥", "Absolutely fantastic! 🌟🎉", "You're making waves! 🌊😄", "Keep being awesome! 😎✨", "Epic job! 🚀🥳", "You're flying high! ✈️😊", "Outstanding job! 🌟🎈", "You nailed it! 🎯😄", "Keep soaring! 🦅✨", "You're incredible! 🤩🙌", "You're on fire! 🔥🥳", "Amazing job, keep it up! 🚀😄", "You're thriving! 🌱😊", "Extraordinary effort! 🎖️👏", "Keep shining bright! ✨😄", "Magnificent performance! 🌟🙌", "You're unstoppable! 🚀💪", "You're a powerhouse! 💥🥳", "You're a true superstar! 🤩🌟", "Epic performance! 🚀🎉", "You're doing wonderfully! 😊👏", "Great momentum! Keep it going! 🌟🚀", "Keep dazzling! ✨😄", "You're making magic happen! ✨🪄", "You're unstoppable! 🚀🔥", "Incredible progress! 🙌😄", "You're phenomenal! 🌟🥳", "Keep shining bright! ✨🌞", "You're slaying! 🔥👏", "You're positively radiant! 😊✨", "You're unstoppable today! 🚀🎊", "Outstanding performance! 👏😊", "Keep being fabulous! 🌟🎈", "You're rocking this! 🎸🥳", "You're amazing! Keep going! 🌟✨", "You're absolutely brilliant! 💡🎉", "Keep conquering! 🏅🚀", "Fantastic work! Keep soaring! ✈️🌟", "You're truly impressive! 👏✨", "You're extraordinary! 🌟😊", "Great job! Keep thriving! 🌱🎉", "You're exceptional! 🎉🌟", "Keep up the awesome work! 🙌🥳", "You're fantastic! ✨😄", "You're truly inspirational! 🌈👏", "You're absolutely smashing it! 🚀💥", "You're outstanding! 🌟🎉", "Keep making us proud! 😊🙌", "You're truly unstoppable! 🚀🎈", "You're amazing! Keep pushing! 💪🥳", "You're a legend! 🏅😄", "Keep lighting it up! 🔥✨", "You're doing incredible! 🎉👏", "You're truly spectacular! 🌠😊", "Keep it going! You're doing great! 💪✨", "You're wonderful! 🌟😄", "You're unstoppable brilliance! 🚀✨", "You're absolutely rocking it! 🎸😊", "Keep reaching new heights! 🏔️🎉", "You're superb! ✨🙌", "You're on a fantastic roll! 🎲🥳", "Keep crushing those goals! 🎯😄", "You're brilliant! 💡✨", "You're fantastic beyond words! 🎉👏", "You're totally rocking it! 🤘😎", "Keep it up, superstar! 🌟😊", "You're shining bright today! ✨😄", "Keep smashing it! 🚀💥", "You're truly unstoppable! 🚀🎊", "Outstanding effort! 🎖️✨", "You're awesome, keep it going! 🎉😄", "Keep breaking barriers! 🚧💪", "You're extraordinary every day! 🎉😊", "Keep achieving greatness! 🏆✨", "You're a shining example! ✨😊", "You're a total winner! 🏅😄", "Keep shining, you're amazing! ✨🌞", "You're absolutely crushing it! 💪🔥", "You're fantastic today! 🎉😄", "Keep the greatness coming! 🚀✨", "You're inspirational! 🌈😊", "You're lighting it up! 🔥🎈", "Keep soaring high! 🦅✨", "You're doing an awesome job! 🎉😊", "You're unstoppable greatness! 🚀🌟", "Keep going strong! 💪😄", "You're absolutely remarkable! 🎖️✨", "Keep being amazing! 🌟😊", "You're thriving wonderfully! 🌱🎉", "You're absolutely incredible! 🌠😄", "Keep shining! ✨🎈", "You're exceptional! 🌟👏", "You're unstoppable brilliance today! 🚀😄", "Keep up the excellent work! 🎉🙌", "You're extraordinary! Keep going! 🌟😊", "Keep pushing forward! 🚀🎉", "You're making fantastic progress! 🎈😊", "You're an absolute champion! 🏆😄", "Keep slaying your goals! 🔥👏", "You're fantastic! Keep going strong! 🎉💪", "You're totally impressive! 🌟😄", "Keep rocking! 🎸✨", "You're absolutely magnificent! 🎉🌟", "You're on a roll! Keep it up! 🎲😄", "You're exceptional today! 🎉👏", "Keep shining brightly! ✨😊", "You're totally unstoppable! 🚀🥳", "You're thriving and inspiring! 🌱😊", "Keep excelling! 🎖️😄", "You're doing wonderfully today! 🌟🎉", "You're making it happen! 🚀✨", "Keep being unstoppable! 🔥💪", "You're spectacular! 🎉🌠", "Keep achieving greatness! 🏆✨", "You're positively radiant today! 😊✨", "Keep being fantastic! 🌟😄", "You're crushing everything! 💥💪", "Keep up the amazing work! 🎉🙌", "You're totally epic! 🚀😄", "You're remarkable! 🌟👏", "Keep shining, you're a star! ✨😊", "You're truly magnificent! 🎉😄", "You're on fire! 🔥🚀", "Keep being incredible! 🌟😄", "You're unstoppable today! 🚀✨"],
  "android-en": ["You're doing amazing! 🎉✨", "Fantastic job! Keep it up! 🚀🎈", "You're crushing it! 💪😄", "Awesome work! 👏🥳", "Impressive progress! 🌠🙌", "Way to go! 🥳🔥", "Outstanding performance! 🥇👏", "You're incredible! 🤩✨", "Keep up the fantastic work! 🎈🙌", "You've got this! 💪🎉", "Bravo! 👏🎊", "So proud of you! 🌟😊", "Keep up the amazing effort! 🙌🔥", "You're a total champion! 🏆😄", "Great job, keep rocking! 🤘🎉", "You're unstoppable today! 🚀💥", "Absolutely fantastic! 🌟🎉", "You're making waves! 🌊😄", "Keep being awesome! 😎✨", "Epic job! 🚀🥳", "You're flying high! ✈️😊", "Outstanding job! 🌟🎈", "You nailed it! 🎯😄", "Keep soaring! 🦅✨", "You're incredible! 🤩🙌", "You're on fire! 🔥🥳", "Amazing job, keep it up! 🚀😄", "You're thriving! 🌱😊", "Extraordinary effort! 🎖️👏", "Keep shining bright! ✨😄", "Magnificent performance! 🌟🙌", "You're unstoppable! 🚀💪", "You're a powerhouse! 💥🥳", "You're a true superstar! 🤩🌟", "Epic performance! 🚀🎉", "You're doing wonderfully! 😊👏", "Great momentum! Keep it going! 🌟🚀", "Keep dazzling! ✨😄", "You're making magic happen! ✨🪄", "You're unstoppable! 🚀🔥", "Incredible progress! 🙌😄", "You're phenomenal! 🌟🥳", "Keep shining bright! ✨🌞", "You're slaying! 🔥👏", "You're positively radiant! 😊✨", "You're unstoppable today! 🚀🎊", "Outstanding performance! 👏😊", "Keep being fabulous! 🌟🎈", "You're rocking this! 🎸🥳", "You're amazing! Keep going! 🌟✨", "You're absolutely brilliant! 💡🎉", "Keep conquering! 🏅🚀", "Fantastic work! Keep soaring! ✈️🌟", "You're truly impressive! 👏✨", "You're extraordinary! 🌟😊", "Great job! Keep thriving! 🌱🎉", "You're exceptional! 🎉🌟", "Keep up the awesome work! 🙌🥳", "You're fantastic! ✨😄", "You're truly inspirational! 🌈👏", "You're absolutely smashing it! 🚀💥", "You're outstanding! 🌟🎉", "Keep making us proud! 😊🙌", "You're truly unstoppable! 🚀🎈", "You're amazing! Keep pushing! 💪🥳", "You're a legend! 🏅😄", "Keep lighting it up! 🔥✨", "You're doing incredible! 🎉👏", "You're truly spectacular! 🌠😊", "Keep it going! You're doing great! 💪✨", "You're wonderful! 🌟😄", "You're unstoppable brilliance! 🚀✨", "You're absolutely rocking it! 🎸😊", "Keep reaching new heights! 🏔️🎉", "You're superb! ✨🙌", "You're on a fantastic roll! 🎲🥳", "Keep crushing those goals! 🎯😄", "You're brilliant! 💡✨", "You're fantastic beyond words! 🎉👏", "You're totally rocking it! 🤘😎", "Keep it up, superstar! 🌟😊", "You're shining bright today! ✨😄", "Keep smashing it! 🚀💥", "You're truly unstoppable! 🚀🎊", "Outstanding effort! 🎖️✨", "You're awesome, keep it going! 🎉😄", "Keep breaking barriers! 🚧💪", "You're extraordinary every day! 🎉😊", "Keep achieving greatness! 🏆✨", "You're a shining example! ✨😊", "You're a total winner! 🏅😄", "Keep shining, you're amazing! ✨🌞", "You're absolutely crushing it! 💪🔥", "You're fantastic today! 🎉😄", "Keep the greatness coming! 🚀✨", "You're inspirational! 🌈😊", "You're lighting it up! 🔥🎈", "Keep soaring high! 🦅✨", "You're doing an awesome job! 🎉😊", "You're unstoppable greatness! 🚀🌟", "Keep going strong! 💪😄", "You're absolutely remarkable! 🎖️✨", "Keep being amazing! 🌟😊", "You're thriving wonderfully! 🌱🎉", "You're absolutely incredible! 🌠😄", "Keep shining! ✨🎈", "You're exceptional! 🌟👏", "You're unstoppable brilliance today! 🚀😄", "Keep up the excellent work! 🎉🙌", "You're extraordinary! Keep going! 🌟😊", "Keep pushing forward! 🚀🎉", "You're making fantastic progress! 🎈😊", "You're an absolute champion! 🏆😄", "Keep slaying your goals! 🔥👏", "You're fantastic! Keep going strong! 🎉💪", "You're totally impressive! 🌟😄", "Keep rocking! 🎸✨", "You're absolutely magnificent! 🎉🌟", "You're on a roll! Keep it up! 🎲😄", "You're exceptional today! 🎉👏", "Keep shining brightly! ✨😊", "You're totally unstoppable! 🚀🥳", "You're thriving and inspiring! 🌱😊", "Keep excelling! 🎖️😄", "You're doing wonderfully today! 🌟🎉", "You're making it happen! 🚀✨", "Keep being unstoppable! 🔥💪", "You're spectacular! 🎉🌠", "Keep achieving greatness! 🏆✨", "You're positively radiant today! 😊✨", "Keep being fantastic! 🌟😄", "You're crushing everything! 💥💪", "Keep up the amazing work! 🎉🙌", "You're totally epic! 🚀😄", "You're remarkable! 🌟👏", "Keep shining, you're a star! ✨😊", "You're truly magnificent! 🎉😄", "You're on fire! 🔥🚀", "Keep being incredible! 🌟😄", "You're unstoppable today! 🚀✨"],
  "compsci-en": ["You're doing amazing! 🎉✨", "Fantastic job! Keep it up! 🚀🎈", "You're crushing it! 💪😄", "Awesome work! 👏🥳", "Impressive progress! 🌠🙌", "Way to go! 🥳🔥", "Outstanding performance! 🥇👏", "You're incredible! 🤩✨", "Keep up the fantastic work! 🎈🙌", "You've got this! 💪🎉", "Bravo! 👏🎊", "So proud of you! 🌟😊", "Keep up the amazing effort! 🙌🔥", "You're a total champion! 🏆😄", "Great job, keep rocking! 🤘🎉", "You're unstoppable today! 🚀💥", "Absolutely fantastic! 🌟🎉", "You're making waves! 🌊😄", "Keep being awesome! 😎✨", "Epic job! 🚀🥳", "You're flying high! ✈️😊", "Outstanding job! 🌟🎈", "You nailed it! 🎯😄", "Keep soaring! 🦅✨", "You're incredible! 🤩🙌", "You're on fire! 🔥🥳", "Amazing job, keep it up! 🚀😄", "You're thriving! 🌱😊", "Extraordinary effort! 🎖️👏", "Keep shining bright! ✨😄", "Magnificent performance! 🌟🙌", "You're unstoppable! 🚀💪", "You're a powerhouse! 💥🥳", "You're a true superstar! 🤩🌟", "Epic performance! 🚀🎉", "You're doing wonderfully! 😊👏", "Great momentum! Keep it going! 🌟🚀", "Keep dazzling! ✨😄", "You're making magic happen! ✨🪄", "You're unstoppable! 🚀🔥", "Incredible progress! 🙌😄", "You're phenomenal! 🌟🥳", "Keep shining bright! ✨🌞", "You're slaying! 🔥👏", "You're positively radiant! 😊✨", "You're unstoppable today! 🚀🎊", "Outstanding performance! 👏😊", "Keep being fabulous! 🌟🎈", "You're rocking this! 🎸🥳", "You're amazing! Keep going! 🌟✨", "You're absolutely brilliant! 💡🎉", "Keep conquering! 🏅🚀", "Fantastic work! Keep soaring! ✈️🌟", "You're truly impressive! 👏✨", "You're extraordinary! 🌟😊", "Great job! Keep thriving! 🌱🎉", "You're exceptional! 🎉🌟", "Keep up the awesome work! 🙌🥳", "You're fantastic! ✨😄", "You're truly inspirational! 🌈👏", "You're absolutely smashing it! 🚀💥", "You're outstanding! 🌟🎉", "Keep making us proud! 😊🙌", "You're truly unstoppable! 🚀🎈", "You're amazing! Keep pushing! 💪🥳", "You're a legend! 🏅😄", "Keep lighting it up! 🔥✨", "You're doing incredible! 🎉👏", "You're truly spectacular! 🌠😊", "Keep it going! You're doing great! 💪✨", "You're wonderful! 🌟😄", "You're unstoppable brilliance! 🚀✨", "You're absolutely rocking it! 🎸😊", "Keep reaching new heights! 🏔️🎉", "You're superb! ✨🙌", "You're on a fantastic roll! 🎲🥳", "Keep crushing those goals! 🎯😄", "You're brilliant! 💡✨", "You're fantastic beyond words! 🎉👏", "You're totally rocking it! 🤘😎", "Keep it up, superstar! 🌟😊", "You're shining bright today! ✨😄", "Keep smashing it! 🚀💥", "You're truly unstoppable! 🚀🎊", "Outstanding effort! 🎖️✨", "You're awesome, keep it going! 🎉😄", "Keep breaking barriers! 🚧💪", "You're extraordinary every day! 🎉😊", "Keep achieving greatness! 🏆✨", "You're a shining example! ✨😊", "You're a total winner! 🏅😄", "Keep shining, you're amazing! ✨🌞", "You're absolutely crushing it! 💪🔥", "You're fantastic today! 🎉😄", "Keep the greatness coming! 🚀✨", "You're inspirational! 🌈😊", "You're lighting it up! 🔥🎈", "Keep soaring high! 🦅✨", "You're doing an awesome job! 🎉😊", "You're unstoppable greatness! 🚀🌟", "Keep going strong! 💪😄", "You're absolutely remarkable! 🎖️✨", "Keep being amazing! 🌟😊", "You're thriving wonderfully! 🌱🎉", "You're absolutely incredible! 🌠😄", "Keep shining! ✨🎈", "You're exceptional! 🌟👏", "You're unstoppable brilliance today! 🚀😄", "Keep up the excellent work! 🎉🙌", "You're extraordinary! Keep going! 🌟😊", "Keep pushing forward! 🚀🎉", "You're making fantastic progress! 🎈😊", "You're an absolute champion! 🏆😄", "Keep slaying your goals! 🔥👏", "You're fantastic! Keep going strong! 🎉💪", "You're totally impressive! 🌟😄", "Keep rocking! 🎸✨", "You're absolutely magnificent! 🎉🌟", "You're on a roll! Keep it up! 🎲😄", "You're exceptional today! 🎉👏", "Keep shining brightly! ✨😊", "You're totally unstoppable! 🚀🥳", "You're thriving and inspiring! 🌱😊", "Keep excelling! 🎖️😄", "You're doing wonderfully today! 🌟🎉", "You're making it happen! 🚀✨", "Keep being unstoppable! 🔥💪", "You're spectacular! 🎉🌠", "Keep achieving greatness! 🏆✨", "You're positively radiant today! 😊✨", "Keep being fantastic! 🌟😄", "You're crushing everything! 💥💪", "Keep up the amazing work! 🎉🙌", "You're totally epic! 🚀😄", "You're remarkable! 🌟👏", "Keep shining, you're a star! ✨😊", "You're truly magnificent! 🎉😄", "You're on fire! 🔥🚀", "Keep being incredible! 🌟😄", "You're unstoppable today! 🚀✨"]
};
export const getRandomCelebrationMessage = (userLanguage = "en") => {
  const messages = celebrationMessages[userLanguage] || celebrationMessages.en;
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
};