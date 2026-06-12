-- =============================================================================
-- SEED FILE: seed_lessons.sql
-- Purpose: Demo data for testing the full course → lesson → section → exercise flow
--
-- TODO: replace with test instructor UUID (waiting on Supabase access)
-- Placeholder: 'ffffffff-ffff-ffff-ffff-ffffffffffff'
-- Note: per migration 005, instructor_id references public.users(id), so the
-- replacement UUID must belong to a row in public.users (auto-created from
-- auth.users by the signup trigger in migration 002).
-- =============================================================================


-- ============================================================
-- COURSES (3 total, one per difficulty level)
-- ============================================================

INSERT INTO courses (id, title, description, difficulty, duration_minutes, instructor_id, published)
VALUES
  (
    '10000000-0000-0000-0000-000000000001',
    'Introduction to Python',
    'A beginner-friendly introduction to programming using Python. You will learn the core building blocks of any program: variables, data types, control flow, and functions. By the end you will be able to write simple scripts and solve real problems with code.',
    'Beginner',
    120,
    'ffffffff-ffff-ffff-ffff-ffffffffffff',
    true
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    'Web Basics',
    'An intermediate course covering how the web works. You will build pages with HTML, style them with CSS, and add interactivity with JavaScript. By the end you will understand how every website you visit is constructed.',
    'Intermediate',
    180,
    'ffffffff-ffff-ffff-ffff-ffffffffffff',
    true
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    'Logic & Data Structures',
    'An advanced course on the foundations of computer science. You will study boolean logic, algorithmic thinking, and the key data structures — arrays, linked lists, trees, and graphs — that power modern software.',
    'Advanced',
    240,
    'ffffffff-ffff-ffff-ffff-ffffffffffff',
    true
  )
ON CONFLICT DO NOTHING;


-- ============================================================
-- LESSONS (3 per course, 9 total)
-- ============================================================

-- Course 1: Introduction to Python
INSERT INTO lessons (id, title, lesson_order, course_id)
VALUES
  ('20000000-0000-0000-0000-000000000001', 'Getting Started with Python', 1, '10000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000002', 'Variables and Data Types',    2, '10000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000003', 'Control Flow',                3, '10000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- Course 2: Web Basics
INSERT INTO lessons (id, title, lesson_order, course_id)
VALUES
  ('20000000-0000-0000-0000-000000000004', 'HTML Fundamentals',           1, '10000000-0000-0000-0000-000000000002'),
  ('20000000-0000-0000-0000-000000000005', 'CSS Styling',                 2, '10000000-0000-0000-0000-000000000002'),
  ('20000000-0000-0000-0000-000000000006', 'Introduction to JavaScript',  3, '10000000-0000-0000-0000-000000000002')
ON CONFLICT DO NOTHING;

-- Course 3: Logic & Data Structures
INSERT INTO lessons (id, title, lesson_order, course_id)
VALUES
  ('20000000-0000-0000-0000-000000000007', 'Boolean Logic and Algorithms', 1, '10000000-0000-0000-0000-000000000003'),
  ('20000000-0000-0000-0000-000000000008', 'Arrays and Lists',             2, '10000000-0000-0000-0000-000000000003'),
  ('20000000-0000-0000-0000-000000000009', 'Trees and Graphs',             3, '10000000-0000-0000-0000-000000000003')
ON CONFLICT DO NOTHING;


-- ============================================================
-- SECTIONS (2 per lesson, 18 total)
-- ============================================================

-- Lesson 1: Getting Started with Python
INSERT INTO sections (id, lesson_id, title, content, section_order)
VALUES
  (
    '30000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    'What is Python?',
    'Python is a high-level, general-purpose programming language known for its simple and readable syntax. Created by Guido van Rossum in 1991, Python is widely used in web development, data science, artificial intelligence, and automation. Unlike languages such as C or Java, Python does not require you to declare variable types or manage memory manually. This makes it an ideal first language for beginners. Python code reads almost like plain English, which means you can focus on learning programming concepts rather than fighting with complex syntax.',
    1
  ),
  (
    '30000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000001',
    'Your First Python Program',
    'The first program most developers write in any language displays "Hello, World!" on the screen. In Python, this is just one line: print("Hello, World!"). The print() function is a built-in function that outputs text to the console. When you run this program, Python reads the instruction, calls the print function with the text you provided, and displays it. This simple example teaches the most fundamental idea in programming: giving the computer instructions that it executes in order.',
    2
  )
ON CONFLICT DO NOTHING;

-- Lesson 2: Variables and Data Types
INSERT INTO sections (id, lesson_id, title, content, section_order)
VALUES
  (
    '30000000-0000-0000-0000-000000000003',
    '20000000-0000-0000-0000-000000000002',
    'What are Variables?',
    'A variable is a named container that stores a value in your program. In Python, you create a variable by writing its name, an equals sign, and the value — for example, name = "Ammar" or age = 20. You do not need to declare the type beforehand; Python figures it out automatically. Variable names should be descriptive and use lowercase letters with underscores (e.g., student_name). Once created, you can use a variable''s name anywhere in your program to access or change its stored value.',
    1
  ),
  (
    '30000000-0000-0000-0000-000000000004',
    '20000000-0000-0000-0000-000000000002',
    'Common Data Types',
    'Python has several built-in data types you will use regularly. A string (str) is a sequence of characters in quotes, like "hello". An integer (int) is a whole number like 42. A float is a decimal number like 3.14. A boolean (bool) can only be True or False. You can check the type of any value using the type() function — for example, type(42) returns <class "int">. Understanding data types is important because different types support different operations: you can add two integers, but adding a string and an integer causes a TypeError.',
    2
  )
ON CONFLICT DO NOTHING;

-- Lesson 3: Control Flow
INSERT INTO sections (id, lesson_id, title, content, section_order)
VALUES
  (
    '30000000-0000-0000-0000-000000000005',
    '20000000-0000-0000-0000-000000000003',
    'If/Else Statements',
    'Control flow determines the order in which your program executes instructions. The if statement lets you run a block of code only when a condition is true. If the condition is false, an optional else block provides an alternative. For example: if age >= 18: print("Adult") else: print("Minor"). Python uses indentation to define code blocks rather than curly braces. This keeps code readable but means consistent indentation is essential — a missing or extra space will cause a syntax error.',
    1
  ),
  (
    '30000000-0000-0000-0000-000000000006',
    '20000000-0000-0000-0000-000000000003',
    'For Loops',
    'A for loop lets you repeat a block of code for each item in a sequence. In Python, a common use is iterating over a list: for item in ["apple", "banana", "cherry"]: print(item). You can also use range() to repeat code a fixed number of times — for i in range(5): print(i) prints 0 through 4. Loops are one of the most powerful tools in programming because they let you process large amounts of data without writing repetitive code. The loop variable takes on each value from the sequence in turn.',
    2
  )
ON CONFLICT DO NOTHING;

-- Lesson 4: HTML Fundamentals
INSERT INTO sections (id, lesson_id, title, content, section_order)
VALUES
  (
    '30000000-0000-0000-0000-000000000007',
    '20000000-0000-0000-0000-000000000004',
    'What is HTML?',
    'HTML (HyperText Markup Language) is the standard language used to create the structure of web pages. Every website you visit is built on HTML. HTML uses elements called tags to describe content — for example, <h1> defines a heading, <p> defines a paragraph, and <a> defines a link. Tags usually come in pairs: an opening tag like <p> and a closing tag like </p>, with content in between. A browser reads your HTML file and renders it visually, turning your markup into the page the user sees.',
    1
  ),
  (
    '30000000-0000-0000-0000-000000000008',
    '20000000-0000-0000-0000-000000000004',
    'HTML Document Structure',
    'Every HTML page follows a standard structure. At the top is the <!DOCTYPE html> declaration, which tells the browser this is an HTML5 document. Inside the <html> element are two main sections: <head> and <body>. The <head> contains metadata — the page title, character set, and links to stylesheets. The <body> contains all the content the user actually sees: headings, paragraphs, images, and links. Understanding this structure is the foundation for building any web page.',
    2
  )
ON CONFLICT DO NOTHING;

-- Lesson 5: CSS Styling
INSERT INTO sections (id, lesson_id, title, content, section_order)
VALUES
  (
    '30000000-0000-0000-0000-000000000009',
    '20000000-0000-0000-0000-000000000005',
    'What is CSS?',
    'CSS (Cascading Style Sheets) controls the visual appearance of HTML elements. While HTML provides structure, CSS provides style — colors, fonts, spacing, and layout. A CSS rule consists of a selector (which element to style) and a declaration block (the styles to apply). For example: p { color: blue; font-size: 16px; } selects all paragraph elements and makes the text blue at 16 pixels. You can write CSS in a separate .css file, inside a <style> tag in the HTML head, or directly on an element using the style attribute.',
    1
  ),
  (
    '30000000-0000-0000-0000-000000000010',
    '20000000-0000-0000-0000-000000000005',
    'The Box Model',
    'Every element on a web page is a rectangular box. The CSS box model describes how these boxes are sized and spaced. From the inside out, a box has: content (the text or image), padding (space between content and border), border (a line around the padding), and margin (space outside the border). For example, setting padding: 20px adds 20 pixels of space inside the border on all four sides. Understanding the box model is essential for controlling layout and spacing on any web page.',
    2
  )
ON CONFLICT DO NOTHING;

-- Lesson 6: Introduction to JavaScript
INSERT INTO sections (id, lesson_id, title, content, section_order)
VALUES
  (
    '30000000-0000-0000-0000-000000000011',
    '20000000-0000-0000-0000-000000000006',
    'What is JavaScript?',
    'JavaScript is the programming language of the web. While HTML defines structure and CSS defines style, JavaScript adds behaviour — making pages interactive and dynamic. You can use JavaScript to respond to button clicks, validate form inputs, fetch data from a server, and update the page without reloading. JavaScript runs directly in the browser, so no installation is needed. It is also used server-side via Node.js, making it one of the most versatile languages in the world.',
    1
  ),
  (
    '30000000-0000-0000-0000-000000000012',
    '20000000-0000-0000-0000-000000000006',
    'DOM Manipulation',
    'The DOM (Document Object Model) is the browser''s in-memory representation of your HTML page. JavaScript can read and modify the DOM, changing the content, structure, and styles of a page on the fly. You can select an element using document.getElementById("myId") or document.querySelector(".myClass"), then change its text with element.textContent = "New text" or its style with element.style.color = "red". This ability to change the page dynamically is what makes modern websites feel like applications rather than static documents.',
    2
  )
ON CONFLICT DO NOTHING;

-- Lesson 7: Boolean Logic and Algorithms
INSERT INTO sections (id, lesson_id, title, content, section_order)
VALUES
  (
    '30000000-0000-0000-0000-000000000013',
    '20000000-0000-0000-0000-000000000007',
    'Boolean Logic',
    'Boolean logic is the foundation of computing. Every decision a computer makes — from a simple if statement to a complex database query — comes down to evaluating conditions that are either true or false. The three fundamental boolean operations are AND (both conditions must be true), OR (at least one must be true), and NOT (inverts a value). These can be combined into truth tables to reason about complex conditions. Understanding boolean logic helps you write correct conditionals, design efficient queries, and think clearly about algorithms.',
    1
  ),
  (
    '30000000-0000-0000-0000-000000000014',
    '20000000-0000-0000-0000-000000000007',
    'Introduction to Algorithms',
    'An algorithm is a step-by-step procedure for solving a problem. Good algorithms are correct (they produce the right answer), efficient (they use minimal time and memory), and clear (they can be implemented by someone else). Computer scientists use Big O notation to describe how performance scales as input size grows. A linear search through an unsorted list is O(n) — it takes proportionally longer as the list grows. A binary search on a sorted list is O(log n) — much faster for large inputs. Learning to think algorithmically is one of the most valuable skills in computer science.',
    2
  )
ON CONFLICT DO NOTHING;

-- Lesson 8: Arrays and Lists
INSERT INTO sections (id, lesson_id, title, content, section_order)
VALUES
  (
    '30000000-0000-0000-0000-000000000015',
    '20000000-0000-0000-0000-000000000008',
    'Arrays',
    'An array is an ordered collection of elements stored at contiguous memory locations. Arrays are zero-indexed, so the first element is at index 0, the second at index 1, and so on. Accessing any element by index is O(1) — instant — making arrays excellent for random access. However, inserting or deleting elements in the middle is O(n) because every subsequent element must be shifted. Arrays have a fixed size in many languages, though dynamic arrays (like Python lists) resize automatically. Arrays are the most fundamental data structure and appear in virtually every program.',
    1
  ),
  (
    '30000000-0000-0000-0000-000000000016',
    '20000000-0000-0000-0000-000000000008',
    'Linked Lists',
    'A linked list is a data structure where each element (called a node) contains a value and a pointer to the next node. Unlike arrays, linked list nodes do not need to be in contiguous memory — they can be scattered anywhere and connected through pointers. This makes inserting and deleting nodes at the beginning or end O(1), since no shifting is needed. However, accessing an element by index requires traversing from the head, making it O(n). Linked lists are the foundation for stacks, queues, and certain tree implementations.',
    2
  )
ON CONFLICT DO NOTHING;

-- Lesson 9: Trees and Graphs
INSERT INTO sections (id, lesson_id, title, content, section_order)
VALUES
  (
    '30000000-0000-0000-0000-000000000017',
    '20000000-0000-0000-0000-000000000009',
    'Binary Trees',
    'A tree is a hierarchical data structure made up of nodes connected by edges. Each tree has a root node at the top, and every other node has exactly one parent. A binary tree is a type where each node has at most two children, called left and right. Binary Search Trees (BSTs) add an ordering rule: all values in the left subtree are smaller than the node, all values in the right are larger. This allows search, insertion, and deletion in O(log n) on a balanced tree. Trees are used in file systems, databases, and parsers.',
    1
  ),
  (
    '30000000-0000-0000-0000-000000000018',
    '20000000-0000-0000-0000-000000000009',
    'Graphs',
    'A graph is a data structure consisting of nodes (vertices) connected by edges. Unlike trees, graphs can have cycles — paths that loop back to a starting node — and a node can have any number of connections. Graphs can be directed (edges have a direction, like a one-way street) or undirected (edges go both ways). They model social networks, maps, dependency systems, and the internet itself. The two fundamental traversal algorithms are Breadth-First Search (BFS), which explores level by level, and Depth-First Search (DFS), which goes as deep as possible before backtracking.',
    2
  )
ON CONFLICT DO NOTHING;


-- ============================================================
-- EXERCISES (2 per section, 36 total)
-- ============================================================

-- Section 1: What is Python?
INSERT INTO exercises (id, section_id, question, exercise_type, correct_answer, options, exercise_order)
VALUES
  (
    '40000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001',
    'Who created the Python programming language?',
    'multiple_choice',
    'Guido van Rossum',
    '["Guido van Rossum", "Linus Torvalds", "Dennis Ritchie", "James Gosling"]'::jsonb,
    1
  ),
  (
    '40000000-0000-0000-0000-000000000002',
    '30000000-0000-0000-0000-000000000001',
    'Name one real-world field where Python is commonly used.',
    'text',
    'data science',
    NULL,
    2
  )
ON CONFLICT DO NOTHING;

-- Section 2: Your First Python Program
INSERT INTO exercises (id, section_id, question, exercise_type, correct_answer, options, exercise_order)
VALUES
  (
    '40000000-0000-0000-0000-000000000003',
    '30000000-0000-0000-0000-000000000002',
    'Which function is used to display output in Python?',
    'multiple_choice',
    'print()',
    '["print()", "display()", "output()", "show()"]'::jsonb,
    1
  ),
  (
    '40000000-0000-0000-0000-000000000004',
    '30000000-0000-0000-0000-000000000002',
    'Write the Python code to print the message: Hello, World!',
    'text',
    'print("Hello, World!")',
    NULL,
    2
  )
ON CONFLICT DO NOTHING;

-- Section 3: What are Variables?
INSERT INTO exercises (id, section_id, question, exercise_type, correct_answer, options, exercise_order)
VALUES
  (
    '40000000-0000-0000-0000-000000000005',
    '30000000-0000-0000-0000-000000000003',
    'Which of the following is a valid Python variable name?',
    'multiple_choice',
    'student_name',
    '["student_name", "2name", "student-name", "student name"]'::jsonb,
    1
  ),
  (
    '40000000-0000-0000-0000-000000000006',
    '30000000-0000-0000-0000-000000000003',
    'Write a Python line that creates a variable called age and sets it to 25.',
    'text',
    'age = 25',
    NULL,
    2
  )
ON CONFLICT DO NOTHING;

-- Section 4: Common Data Types
INSERT INTO exercises (id, section_id, question, exercise_type, correct_answer, options, exercise_order)
VALUES
  (
    '40000000-0000-0000-0000-000000000007',
    '30000000-0000-0000-0000-000000000004',
    'What data type would Python assign to the value 3.14?',
    'multiple_choice',
    'float',
    '["float", "int", "str", "bool"]'::jsonb,
    1
  ),
  (
    '40000000-0000-0000-0000-000000000008',
    '30000000-0000-0000-0000-000000000004',
    'What Python function can you use to check the data type of a variable?',
    'text',
    'type()',
    NULL,
    2
  )
ON CONFLICT DO NOTHING;

-- Section 5: If/Else Statements
INSERT INTO exercises (id, section_id, question, exercise_type, correct_answer, options, exercise_order)
VALUES
  (
    '40000000-0000-0000-0000-000000000009',
    '30000000-0000-0000-0000-000000000005',
    'In Python, how are code blocks inside an if statement defined?',
    'multiple_choice',
    'Indentation',
    '["Indentation", "Curly braces {}", "Square brackets []", "Parentheses ()"]'::jsonb,
    1
  ),
  (
    '40000000-0000-0000-0000-000000000010',
    '30000000-0000-0000-0000-000000000005',
    'What keyword do you use in Python to handle the case when an if condition is false?',
    'text',
    'else',
    NULL,
    2
  )
ON CONFLICT DO NOTHING;

-- Section 6: For Loops
INSERT INTO exercises (id, section_id, question, exercise_type, correct_answer, options, exercise_order)
VALUES
  (
    '40000000-0000-0000-0000-000000000011',
    '30000000-0000-0000-0000-000000000006',
    'What does range(5) produce in Python?',
    'multiple_choice',
    'Numbers 0 to 4',
    '["Numbers 0 to 4", "Numbers 1 to 5", "Numbers 0 to 5", "Numbers 1 to 4"]'::jsonb,
    1
  ),
  (
    '40000000-0000-0000-0000-000000000012',
    '30000000-0000-0000-0000-000000000006',
    'Write a Python for loop that prints each number from 0 to 2.',
    'text',
    'for i in range(3): print(i)',
    NULL,
    2
  )
ON CONFLICT DO NOTHING;

-- Section 7: What is HTML?
INSERT INTO exercises (id, section_id, question, exercise_type, correct_answer, options, exercise_order)
VALUES
  (
    '40000000-0000-0000-0000-000000000013',
    '30000000-0000-0000-0000-000000000007',
    'What does HTML stand for?',
    'multiple_choice',
    'HyperText Markup Language',
    '["HyperText Markup Language", "High Transfer Markup Language", "HyperText Making Language", "Hyperlink and Text Markup Language"]'::jsonb,
    1
  ),
  (
    '40000000-0000-0000-0000-000000000014',
    '30000000-0000-0000-0000-000000000007',
    'What HTML tag is used to define the largest heading on a page?',
    'text',
    '<h1>',
    NULL,
    2
  )
ON CONFLICT DO NOTHING;

-- Section 8: HTML Document Structure
INSERT INTO exercises (id, section_id, question, exercise_type, correct_answer, options, exercise_order)
VALUES
  (
    '40000000-0000-0000-0000-000000000015',
    '30000000-0000-0000-0000-000000000008',
    'Which section of an HTML document contains the visible page content?',
    'multiple_choice',
    '<body>',
    '["<body>", "<head>", "<html>", "<main>"]'::jsonb,
    1
  ),
  (
    '40000000-0000-0000-0000-000000000016',
    '30000000-0000-0000-0000-000000000008',
    'What declaration goes at the very top of every HTML5 document?',
    'text',
    '<!DOCTYPE html>',
    NULL,
    2
  )
ON CONFLICT DO NOTHING;

-- Section 9: What is CSS?
INSERT INTO exercises (id, section_id, question, exercise_type, correct_answer, options, exercise_order)
VALUES
  (
    '40000000-0000-0000-0000-000000000017',
    '30000000-0000-0000-0000-000000000009',
    'What does CSS stand for?',
    'multiple_choice',
    'Cascading Style Sheets',
    '["Cascading Style Sheets", "Creative Style Syntax", "Computer Style Sheets", "Colorful Style Sheets"]'::jsonb,
    1
  ),
  (
    '40000000-0000-0000-0000-000000000018',
    '30000000-0000-0000-0000-000000000009',
    'In CSS, what property changes the text color of an element?',
    'text',
    'color',
    NULL,
    2
  )
ON CONFLICT DO NOTHING;

-- Section 10: The Box Model
INSERT INTO exercises (id, section_id, question, exercise_type, correct_answer, options, exercise_order)
VALUES
  (
    '40000000-0000-0000-0000-000000000019',
    '30000000-0000-0000-0000-000000000010',
    'In the CSS box model, which layer sits directly outside the content?',
    'multiple_choice',
    'Padding',
    '["Padding", "Margin", "Border", "Outline"]'::jsonb,
    1
  ),
  (
    '40000000-0000-0000-0000-000000000020',
    '30000000-0000-0000-0000-000000000010',
    'What CSS property adds space between the content and the border of an element?',
    'text',
    'padding',
    NULL,
    2
  )
ON CONFLICT DO NOTHING;

-- Section 11: What is JavaScript?
INSERT INTO exercises (id, section_id, question, exercise_type, correct_answer, options, exercise_order)
VALUES
  (
    '40000000-0000-0000-0000-000000000021',
    '30000000-0000-0000-0000-000000000011',
    'What role does JavaScript play in web development?',
    'multiple_choice',
    'It adds interactivity and behaviour',
    '["It adds interactivity and behaviour", "It defines page structure", "It controls visual styling", "It manages the database"]'::jsonb,
    1
  ),
  (
    '40000000-0000-0000-0000-000000000022',
    '30000000-0000-0000-0000-000000000011',
    'What is the name of the server-side JavaScript runtime environment?',
    'text',
    'Node.js',
    NULL,
    2
  )
ON CONFLICT DO NOTHING;

-- Section 12: DOM Manipulation
INSERT INTO exercises (id, section_id, question, exercise_type, correct_answer, options, exercise_order)
VALUES
  (
    '40000000-0000-0000-0000-000000000023',
    '30000000-0000-0000-0000-000000000012',
    'What does DOM stand for?',
    'multiple_choice',
    'Document Object Model',
    '["Document Object Model", "Data Object Management", "Dynamic Object Markup", "Document Output Manager"]'::jsonb,
    1
  ),
  (
    '40000000-0000-0000-0000-000000000024',
    '30000000-0000-0000-0000-000000000012',
    'Write JavaScript code to select an element with the id "title".',
    'text',
    'document.getElementById("title")',
    NULL,
    2
  )
ON CONFLICT DO NOTHING;

-- Section 13: Boolean Logic
INSERT INTO exercises (id, section_id, question, exercise_type, correct_answer, options, exercise_order)
VALUES
  (
    '40000000-0000-0000-0000-000000000025',
    '30000000-0000-0000-0000-000000000013',
    'What is the result of: TRUE AND FALSE?',
    'multiple_choice',
    'FALSE',
    '["FALSE", "TRUE", "NULL", "ERROR"]'::jsonb,
    1
  ),
  (
    '40000000-0000-0000-0000-000000000026',
    '30000000-0000-0000-0000-000000000013',
    'What boolean operator returns TRUE only when both conditions are TRUE?',
    'text',
    'AND',
    NULL,
    2
  )
ON CONFLICT DO NOTHING;

-- Section 14: Introduction to Algorithms
INSERT INTO exercises (id, section_id, question, exercise_type, correct_answer, options, exercise_order)
VALUES
  (
    '40000000-0000-0000-0000-000000000027',
    '30000000-0000-0000-0000-000000000014',
    'What is the Big O time complexity of a binary search on a sorted list?',
    'multiple_choice',
    'O(log n)',
    '["O(log n)", "O(n)", "O(n²)", "O(1)"]'::jsonb,
    1
  ),
  (
    '40000000-0000-0000-0000-000000000028',
    '30000000-0000-0000-0000-000000000014',
    'What notation is used to describe how an algorithm''s performance scales with input size?',
    'text',
    'Big O notation',
    NULL,
    2
  )
ON CONFLICT DO NOTHING;

-- Section 15: Arrays
INSERT INTO exercises (id, section_id, question, exercise_type, correct_answer, options, exercise_order)
VALUES
  (
    '40000000-0000-0000-0000-000000000029',
    '30000000-0000-0000-0000-000000000015',
    'What index does the first element of an array have?',
    'multiple_choice',
    '0',
    '["0", "1", "-1", "Depends on the language"]'::jsonb,
    1
  ),
  (
    '40000000-0000-0000-0000-000000000030',
    '30000000-0000-0000-0000-000000000015',
    'What is the Big O time complexity for accessing an element by index in an array?',
    'text',
    'O(1)',
    NULL,
    2
  )
ON CONFLICT DO NOTHING;

-- Section 16: Linked Lists
INSERT INTO exercises (id, section_id, question, exercise_type, correct_answer, options, exercise_order)
VALUES
  (
    '40000000-0000-0000-0000-000000000031',
    '30000000-0000-0000-0000-000000000016',
    'What does each node in a linked list contain?',
    'multiple_choice',
    'A value and a pointer to the next node',
    '["A value and a pointer to the next node", "Only a value", "An index and a value", "A key-value pair"]'::jsonb,
    1
  ),
  (
    '40000000-0000-0000-0000-000000000032',
    '30000000-0000-0000-0000-000000000016',
    'What is the time complexity of inserting a node at the beginning of a linked list?',
    'text',
    'O(1)',
    NULL,
    2
  )
ON CONFLICT DO NOTHING;

-- Section 17: Binary Trees
INSERT INTO exercises (id, section_id, question, exercise_type, correct_answer, options, exercise_order)
VALUES
  (
    '40000000-0000-0000-0000-000000000033',
    '30000000-0000-0000-0000-000000000017',
    'In a Binary Search Tree, where are values smaller than the root stored?',
    'multiple_choice',
    'In the left subtree',
    '["In the left subtree", "In the right subtree", "At the root", "In a separate list"]'::jsonb,
    1
  ),
  (
    '40000000-0000-0000-0000-000000000034',
    '30000000-0000-0000-0000-000000000017',
    'What is the node at the top of a tree called?',
    'text',
    'root',
    NULL,
    2
  )
ON CONFLICT DO NOTHING;

-- Section 18: Graphs
INSERT INTO exercises (id, section_id, question, exercise_type, correct_answer, options, exercise_order)
VALUES
  (
    '40000000-0000-0000-0000-000000000035',
    '30000000-0000-0000-0000-000000000018',
    'Which graph traversal algorithm explores nodes level by level?',
    'multiple_choice',
    'Breadth-First Search (BFS)',
    '["Breadth-First Search (BFS)", "Depth-First Search (DFS)", "Binary Search", "Dijkstra''s Algorithm"]'::jsonb,
    1
  ),
  (
    '40000000-0000-0000-0000-000000000036',
    '30000000-0000-0000-0000-000000000018',
    'What is the key difference between a tree and a graph?',
    'text',
    'A graph can have cycles; a tree cannot',
    NULL,
    2
  )
ON CONFLICT DO NOTHING;
