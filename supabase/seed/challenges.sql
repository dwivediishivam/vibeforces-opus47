insert into public.challenges (
  id, code, category, difficulty, rating, title, description, challenge_data
) values (
  '00000000-0000-4000-8000-000000000001',
  'SP-E1',
  'spec_to_prompt',
  'easy',
  900,
  'FizzBuzz with a Twist',
  'Translate a one-shot voice note into a precise Python prompt.',
  '{"voice_note_url":"/voice-notes/sp-e1.mp3","voice_note_script":"Hey, I need you to write a program. It should print numbers from 1 to 100. But here''s the twist — for multiples of 3, print ''Vibe'' instead of the number. For multiples of 5, print ''Code'' instead. And for multiples of both 3 and 5, print ''VibeCode''. Output it as a Python function that returns a list of strings.","supplementary_images":[],"prompt_mode":"single","expected_behavior":"A Python function returning a list of 100 strings with correct substitutions for \"Vibe\", \"Code\", and \"VibeCode\".","rubric":"Check that the prompt clearly specifies the 1-100 range, all three substitution rules, and that the output is a Python function returning a list of strings. Deduct for ambiguity or missing constraints."}'::jsonb
)
on conflict (id) do update set
  code = excluded.code,
  category = excluded.category,
  difficulty = excluded.difficulty,
  rating = excluded.rating,
  title = excluded.title,
  description = excluded.description,
  challenge_data = excluded.challenge_data;

insert into public.challenges (
  id, code, category, difficulty, rating, title, description, challenge_data
) values (
  '00000000-0000-4000-8000-000000000002',
  'SP-E2',
  'spec_to_prompt',
  'easy',
  1000,
  'CSV Data Summarizer',
  'Capture a data-processing voice note without losing file or sort requirements.',
  '{"voice_note_url":"/voice-notes/sp-e2.mp3","voice_note_script":"I have a CSV file with three columns: name, department, and salary. I need a Python script that reads this CSV file, calculates the average salary per department, and prints the results sorted by average salary from highest to lowest. The file is called employees.csv.","supplementary_images":[],"prompt_mode":"single","expected_behavior":"Python script that reads employees.csv, groups by department, calculates the average salary per department, sorts results descending, and prints the output cleanly.","rubric":"Check for correct filename, grouping by department, average salary calculation, descending sort, and an explicit print/output expectation."}'::jsonb
)
on conflict (id) do update set
  code = excluded.code,
  category = excluded.category,
  difficulty = excluded.difficulty,
  rating = excluded.rating,
  title = excluded.title,
  description = excluded.description,
  challenge_data = excluded.challenge_data;

insert into public.challenges (
  id, code, category, difficulty, rating, title, description, challenge_data
) values (
  '00000000-0000-4000-8000-000000000003',
  'SP-M1',
  'spec_to_prompt',
  'medium',
  1300,
  'REST API Endpoint Design',
  'Plan and act on a CRUD API spec with validation and filtering constraints.',
  '{"voice_note_url":"/voice-notes/sp-m1.mp3","voice_note_script":"Alright, so I need you to help me build a REST API endpoint using Express.js and Node. The endpoint should handle a todo list. I need CRUD operations — create, read, update, delete. Each todo has an id, a title, a description, a status which can be pending, in-progress, or done, and a created_at timestamp. Use an in-memory array for storage, no database needed. But here''s the important part — I need input validation. Title is required and must be between 3 and 100 characters. Status must be one of the three valid values. Return proper HTTP status codes. And add a GET endpoint that supports filtering by status as a query parameter.","supplementary_images":["/screenshots/spec-rest-api-table.svg"],"prompt_mode":"plan_act","expected_behavior":"Working Express.js CRUD API with all five todo endpoints, in-memory storage, validation, proper HTTP status codes, and GET filtering by status.","rubric":"Plan should outline route structure, validation, and error handling. Judge whether all five endpoints exist, validation rules are enforced, status codes are correct, and filtering works."}'::jsonb
)
on conflict (id) do update set
  code = excluded.code,
  category = excluded.category,
  difficulty = excluded.difficulty,
  rating = excluded.rating,
  title = excluded.title,
  description = excluded.description,
  challenge_data = excluded.challenge_data;

insert into public.challenges (
  id, code, category, difficulty, rating, title, description, challenge_data
) values (
  '00000000-0000-4000-8000-000000000004',
  'SP-M2',
  'spec_to_prompt',
  'medium',
  1400,
  'Markdown to HTML Converter',
  'Use a plan-plus-act flow to encode parsing constraints exactly.',
  '{"voice_note_url":"/voice-notes/sp-m2.mp3","voice_note_script":"I need a JavaScript function that converts a subset of Markdown to HTML. It should handle these elements: headings — H1 through H3, so lines starting with one, two, or three hash symbols. Bold text wrapped in double asterisks. Italic text wrapped in single asterisks. Unordered lists where lines start with a dash. And code blocks wrapped in triple backticks. It should be a single function that takes a Markdown string and returns an HTML string. Don''t use any external libraries.","supplementary_images":["/screenshots/spec-markdown-example.svg"],"prompt_mode":"plan_act","expected_behavior":"A pure JavaScript function that converts H1-H3 headings, bold, italic, unordered lists, and fenced code blocks from markdown into HTML.","rubric":"Plan should explain a parsing strategy. Act must cover all five markdown constructs without external libraries and avoid obvious edge-case failures."}'::jsonb
)
on conflict (id) do update set
  code = excluded.code,
  category = excluded.category,
  difficulty = excluded.difficulty,
  rating = excluded.rating,
  title = excluded.title,
  description = excluded.description,
  challenge_data = excluded.challenge_data;

insert into public.challenges (
  id, code, category, difficulty, rating, title, description, challenge_data
) values (
  '00000000-0000-4000-8000-000000000005',
  'SP-H1',
  'spec_to_prompt',
  'hard',
  1700,
  'Real-time Chat Server',
  'Prompt a multi-feature Socket.io room server from a dense spec and diagram.',
  '{"voice_note_url":"/voice-notes/sp-h1.mp3","voice_note_script":"I need a real-time chat application backend using Node.js and Socket.io. Requirements: Users can join named rooms. When a user joins, everyone in that room gets a notification saying who joined. Messages sent in a room are broadcast to all other users in that room, not to the sender. Each message should have a timestamp, the sender''s username, and the message text. Users can be in only one room at a time — joining a new room should leave the old one. Add a slash-command: when a user types /users, they should see a list of all users currently in their room. The server should also maintain a history of the last 50 messages per room, and when a new user joins, they should receive this history. Oh and usernames must be unique across the server — reject duplicates.","supplementary_images":["/screenshots/spec-chat-architecture.svg"],"prompt_mode":"plan_act","expected_behavior":"A Socket.io server that supports unique usernames, room join/leave, room-scoped broadcasts, /users, 50-message history, and metadata on each message.","rubric":"Plan should cover room state, history storage, uniqueness, and slash commands. Score each major feature and deduct for missing room isolation or history replay."}'::jsonb
)
on conflict (id) do update set
  code = excluded.code,
  category = excluded.category,
  difficulty = excluded.difficulty,
  rating = excluded.rating,
  title = excluded.title,
  description = excluded.description,
  challenge_data = excluded.challenge_data;

insert into public.challenges (
  id, code, category, difficulty, rating, title, description, challenge_data
) values (
  '00000000-0000-4000-8000-000000000006',
  'SP-H2',
  'spec_to_prompt',
  'hard',
  1800,
  'Task Scheduler with Dependencies',
  'Turn a graph-and-timing voice note into a parallel Python scheduler.',
  '{"voice_note_url":"/voice-notes/sp-h2.mp3","voice_note_script":"Build me a task scheduling system in Python. Each task has an ID, a name, a duration in seconds, and a list of dependency task IDs — meaning those tasks must complete before this one can start. The scheduler should figure out the correct execution order using topological sorting. It should detect circular dependencies and throw an error if found. Then it should simulate execution: tasks that have no pending dependencies should run in parallel, simulated with asyncio. Print when each task starts and finishes, with timestamps. Finally, calculate and print the total time to complete all tasks and the critical path — that''s the longest chain of dependent tasks.","supplementary_images":["/screenshots/spec-task-graph.svg"],"prompt_mode":"plan_act","expected_behavior":"Python asyncio scheduler with topological sorting, cycle detection, parallel task execution, timestamped logging, and critical-path calculation.","rubric":"Judge topo sort, cycle detection, asyncio-based parallel simulation, timing output, critical path calculation, and clean error handling."}'::jsonb
)
on conflict (id) do update set
  code = excluded.code,
  category = excluded.category,
  difficulty = excluded.difficulty,
  rating = excluded.rating,
  title = excluded.title,
  description = excluded.description,
  challenge_data = excluded.challenge_data;

insert into public.challenges (
  id, code, category, difficulty, rating, title, description, challenge_data
) values (
  '00000000-0000-4000-8000-000000000007',
  'TG-E1',
  'token_golf',
  'easy',
  850,
  'Reverse a String',
  'Produce an iterative Python reversal function with minimal tokens.',
  '{"target_description":"Write a Python function called `reverse_string` that takes a string and returns it reversed. Do not use slicing or the built-in `reversed()` function.","target_output":"def reverse_string(s):\n    result = \"\"\n    for char in s:\n        result = char + result\n    return result","verification_prompt":"Check if the output is a Python function named reverse_string that reverses a string without using slicing or the reversed() built-in. Iterative solutions are acceptable.","max_tokens_allowed":200}'::jsonb
)
on conflict (id) do update set
  code = excluded.code,
  category = excluded.category,
  difficulty = excluded.difficulty,
  rating = excluded.rating,
  title = excluded.title,
  description = excluded.description,
  challenge_data = excluded.challenge_data;

insert into public.challenges (
  id, code, category, difficulty, rating, title, description, challenge_data
) values (
  '00000000-0000-4000-8000-000000000008',
  'TG-E2',
  'token_golf',
  'easy',
  950,
  'Palindrome Checker',
  'Write a short JavaScript palindrome solution with cleanup rules intact.',
  '{"target_description":"Write a JavaScript function `isPalindrome` that checks if a given string is a palindrome, ignoring case and non-alphanumeric characters.","target_output":"function isPalindrome(str) {\n  const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '''');\n  return cleaned === cleaned.split('''').reverse().join('''');\n}","verification_prompt":"Verify that the output is a JavaScript function named isPalindrome that ignores case and non-alphanumeric characters. Functionally equivalent approaches are acceptable.","max_tokens_allowed":250}'::jsonb
)
on conflict (id) do update set
  code = excluded.code,
  category = excluded.category,
  difficulty = excluded.difficulty,
  rating = excluded.rating,
  title = excluded.title,
  description = excluded.description,
  challenge_data = excluded.challenge_data;

insert into public.challenges (
  id, code, category, difficulty, rating, title, description, challenge_data
) values (
  '00000000-0000-4000-8000-000000000009',
  'TG-M1',
  'token_golf',
  'medium',
  1250,
  'Binary Search Tree Insert & Search',
  'Compress a class-based BST implementation without losing behavior.',
  '{"target_description":"Write a Python class `BST` with methods `insert(value)` and `search(value)` implementing a binary search tree. Include a `Node` class with `left`, `right`, and `value` attributes.","target_output":"class Node:\n    def __init__(self, value):\n        self.value = value\n        self.left = None\n        self.right = None\n\nclass BST:\n    def __init__(self):\n        self.root = None\n\n    def insert(self, value):\n        if not self.root:\n            self.root = Node(value)\n        else:\n            self._insert(self.root, value)\n\n    def _insert(self, node, value):\n        if value < node.value:\n            if node.left is None:\n                node.left = Node(value)\n            else:\n                self._insert(node.left, value)\n        else:\n            if node.right is None:\n                node.right = Node(value)\n            else:\n                self._insert(node.right, value)\n\n    def search(self, value):\n        return self._search(self.root, value)\n\n    def _search(self, node, value):\n        if node is None:\n            return False\n        if value == node.value:\n            return True\n        elif value < node.value:\n            return self._search(node.left, value)\n        else:\n            return self._search(node.right, value)","verification_prompt":"Verify this is a BST implementation with a Node class, a BST class, insert(), and search(). Insert must maintain BST ordering and search must return a boolean.","max_tokens_allowed":500}'::jsonb
)
on conflict (id) do update set
  code = excluded.code,
  category = excluded.category,
  difficulty = excluded.difficulty,
  rating = excluded.rating,
  title = excluded.title,
  description = excluded.description,
  challenge_data = excluded.challenge_data;

insert into public.challenges (
  id, code, category, difficulty, rating, title, description, challenge_data
) values (
  '00000000-0000-4000-8000-000000000010',
  'TG-M2',
  'token_golf',
  'medium',
  1350,
  'Debounce Function',
  'Keep a JavaScript debounce utility short while preserving cancel and context behavior.',
  '{"target_description":"Write a JavaScript `debounce` function that takes a function and a delay in ms, returns a debounced version. The debounced function should reset its timer on each call and only execute after the delay has passed since the last call. Include a `cancel()` method on the returned function.","target_output":"function debounce(fn, delay) {\n  let timeoutId;\n  \n  function debounced(...args) {\n    clearTimeout(timeoutId);\n    timeoutId = setTimeout(() => fn.apply(this, args), delay);\n  }\n  \n  debounced.cancel = function() {\n    clearTimeout(timeoutId);\n  };\n  \n  return debounced;\n}","verification_prompt":"Verify this debounce implementation takes a function and delay, resets the timer on each call, preserves this/args, and exposes cancel().","max_tokens_allowed":400}'::jsonb
)
on conflict (id) do update set
  code = excluded.code,
  category = excluded.category,
  difficulty = excluded.difficulty,
  rating = excluded.rating,
  title = excluded.title,
  description = excluded.description,
  challenge_data = excluded.challenge_data;

insert into public.challenges (
  id, code, category, difficulty, rating, title, description, challenge_data
) values (
  '00000000-0000-4000-8000-000000000011',
  'TG-H1',
  'token_golf',
  'hard',
  1650,
  'LRU Cache',
  'Reach a fully working O(1) cache implementation with tight prompt discipline.',
  '{"target_description":"Implement an LRU Cache in Python with O(1) get and put operations. The class `LRUCache` takes a capacity in its constructor. `get(key)` returns the value or -1 if not found. `put(key, value)` inserts or updates. When capacity is exceeded, evict the least recently used item. Use a doubly linked list + hash map approach.","target_output":"class Node:\n    def __init__(self, key=0, value=0):\n        self.key = key\n        self.value = value\n        self.prev = None\n        self.next = None\n\nclass LRUCache:\n    def __init__(self, capacity):\n        self.capacity = capacity\n        self.cache = {}\n        self.head = Node()\n        self.tail = Node()\n        self.head.next = self.tail\n        self.tail.prev = self.head\n\n    def _remove(self, node):\n        node.prev.next = node.next\n        node.next.prev = node.prev\n\n    def _add_to_front(self, node):\n        node.next = self.head.next\n        node.prev = self.head\n        self.head.next.prev = node\n        self.head.next = node\n\n    def get(self, key):\n        if key in self.cache:\n            node = self.cache[key]\n            self._remove(node)\n            self._add_to_front(node)\n            return node.value\n        return -1\n\n    def put(self, key, value):\n        if key in self.cache:\n            self._remove(self.cache[key])\n        node = Node(key, value)\n        self.cache[key] = node\n        self._add_to_front(node)\n        if len(self.cache) > self.capacity:\n            lru = self.tail.prev\n            self._remove(lru)\n            del self.cache[lru.key]","verification_prompt":"Verify this is an LRU cache with O(1) get and put using a doubly linked list plus hash map, correct least-recently-used eviction, -1 misses, and update handling.","max_tokens_allowed":700}'::jsonb
)
on conflict (id) do update set
  code = excluded.code,
  category = excluded.category,
  difficulty = excluded.difficulty,
  rating = excluded.rating,
  title = excluded.title,
  description = excluded.description,
  challenge_data = excluded.challenge_data;

insert into public.challenges (
  id, code, category, difficulty, rating, title, description, challenge_data
) values (
  '00000000-0000-4000-8000-000000000012',
  'TG-H2',
  'token_golf',
  'hard',
  1750,
  'Event Emitter',
  'Minimize prompt tokens without losing chainability or once-listener behavior.',
  '{"target_description":"Implement a JavaScript EventEmitter class with `on(event, callback)`, `off(event, callback)`, `emit(event, ...args)`, and `once(event, callback)`. All methods should return `this`.","target_output":"class EventEmitter {\n  constructor() {\n    this.listeners = {};\n  }\n\n  on(event, callback) {\n    if (!this.listeners[event]) this.listeners[event] = [];\n    this.listeners[event].push(callback);\n    return this;\n  }\n\n  off(event, callback) {\n    if (!this.listeners[event]) return this;\n    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);\n    return this;\n  }\n\n  emit(event, ...args) {\n    if (!this.listeners[event]) return this;\n    this.listeners[event].forEach(cb => cb.apply(this, args));\n    return this;\n  }\n\n  once(event, callback) {\n    const wrapper = (...args) => {\n      callback.apply(this, args);\n      this.off(event, wrapper);\n    };\n    return this.on(event, wrapper);\n  }\n}","verification_prompt":"Verify this is an EventEmitter with on, off, emit, and once. Listeners must receive args, once must self-remove, and every method must be chainable.","max_tokens_allowed":600}'::jsonb
)
on conflict (id) do update set
  code = excluded.code,
  category = excluded.category,
  difficulty = excluded.difficulty,
  rating = excluded.rating,
  title = excluded.title,
  description = excluded.description,
  challenge_data = excluded.challenge_data;

insert into public.challenges (
  id, code, category, difficulty, rating, title, description, challenge_data
) values (
  '00000000-0000-4000-8000-000000000013',
  'BF-E1',
  'bug_fix',
  'easy',
  900,
  'Binary Search Debugging',
  'Inspect a short Python search function and write a precise repair prompt.',
  '{"code":"def binary_search(arr, target):\n    left = 0\n    right = len(arr)\n    while left <= right:\n        mid = (left + right) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    return -1","language":"python","task":"This binary search should find a target index in a sorted array.","bug_description":"right is initialized to len(arr) instead of len(arr) - 1, which can trigger an out-of-range access.","bug_location":"Line 3","expected_fix":"Change `right = len(arr)` to `right = len(arr) - 1`.","rubric":"Judge how precisely the learner identified the off-by-one boundary. Prompts like \"fix this\" should score near zero; prompts that point to the right bound and the exact corrected expression score highly."}'::jsonb
)
on conflict (id) do update set
  code = excluded.code,
  category = excluded.category,
  difficulty = excluded.difficulty,
  rating = excluded.rating,
  title = excluded.title,
  description = excluded.description,
  challenge_data = excluded.challenge_data;

insert into public.challenges (
  id, code, category, difficulty, rating, title, description, challenge_data
) values (
  '00000000-0000-4000-8000-000000000014',
  'BF-E2',
  'bug_fix',
  'easy',
  1000,
  'Sequence Function Debugging',
  'Inspect a short JavaScript numeric function and identify the logic error.',
  '{"code":"function fibonacci(n) {\n  if (n <= 0) return 0;\n  if (n === 1) return 1;\n  \n  let prev = 0, curr = 1;\n  for (let i = 2; i < n; i++) {\n    let temp = curr;\n    curr = prev + curr;\n    prev = temp;\n  }\n  return curr;\n}","language":"javascript","task":"This function should return the nth Fibonacci number.","bug_description":"The loop condition uses i < n instead of i <= n, so it stops one iteration too early.","bug_location":"Line 5 — the for-loop condition","expected_fix":"Change `i < n` to `i <= n`.","rubric":"High scores require identifying the loop condition as the root cause, not just saying the output is wrong."}'::jsonb
)
on conflict (id) do update set
  code = excluded.code,
  category = excluded.category,
  difficulty = excluded.difficulty,
  rating = excluded.rating,
  title = excluded.title,
  description = excluded.description,
  challenge_data = excluded.challenge_data;

insert into public.challenges (
  id, code, category, difficulty, rating, title, description, challenge_data
) values (
  '00000000-0000-4000-8000-000000000015',
  'BF-M1',
  'bug_fix',
  'medium',
  1300,
  'Async Helper Debugging',
  'Review an asynchronous helper and prompt the AI toward the correct repair.',
  '{"code":"class UserCache {\n  constructor() {\n    this.cache = {};\n  }\n\n  async getUser(id) {\n    if (this.cache[id]) {\n      return this.cache[id];\n    }\n\n    const response = await fetch(''/api/users/'' + id);\n    const user = await response.json();\n    this.cache[id] = user;\n    return user;\n  }\n\n  async getUsers(ids) {\n    const results = [];\n    for (const id of ids) {\n      results.push(this.getUser(id));\n    }\n    return results;\n  }\n}","language":"javascript","task":"getUsers should return resolved user objects for all requested ids.","bug_description":"getUsers collects unresolved Promises and returns them directly instead of awaiting them or using Promise.all().","bug_location":"Lines 18-20 — the body of getUsers()","expected_fix":"Return `Promise.all(ids.map((id) => this.getUser(id)))` or await each fetch before pushing.","rubric":"Reward prompts that explicitly mention promises being returned instead of resolved values and suggest Promise.all or awaited collection."}'::jsonb
)
on conflict (id) do update set
  code = excluded.code,
  category = excluded.category,
  difficulty = excluded.difficulty,
  rating = excluded.rating,
  title = excluded.title,
  description = excluded.description,
  challenge_data = excluded.challenge_data;

insert into public.challenges (
  id, code, category, difficulty, rating, title, description, challenge_data
) values (
  '00000000-0000-4000-8000-000000000016',
  'BF-M2',
  'bug_fix',
  'medium',
  1400,
  'React Update Debugging',
  'Inspect a React component with incorrect update behavior and write a targeted fix prompt.',
  '{"code":"import { useState } from ''react'';\n\nfunction TodoList() {\n  const [todos, setTodos] = useState([]);\n  const [input, setInput] = useState('''');\n\n  const addTodo = () => {\n    if (!input.trim()) return;\n    todos.push({ id: Date.now(), text: input, done: false });\n    setTodos(todos);\n    setInput('''');\n  };\n\n  const toggleTodo = (id) => {\n    const todo = todos.find(t => t.id === id);\n    todo.done = !todo.done;\n    setTodos(todos);\n  };\n\n  return (\n    <div>\n      <input value={input} onChange={e => setInput(e.target.value)} />\n      <button onClick={addTodo}>Add</button>\n      <ul>\n        {todos.map(todo => (\n          <li key={todo.id} onClick={() => toggleTodo(todo.id)}\n              style={{ textDecoration: todo.done ? ''line-through'' : ''none'' }}>\n            {todo.text}\n          </li>\n        ))}\n      </ul>\n    </div>\n  );\n}","language":"javascript","task":"The TodoList should rerender correctly when items are added or toggled.","bug_description":"The code mutates React state directly and then passes the same array reference back to setTodos, so React does not detect a change.","bug_location":"Lines 9-10 and 16-17","expected_fix":"Create new arrays and objects when updating state, for example with spreads and map().","rubric":"High scores require mentioning direct mutation and same-reference updates, not just saying React state is broken."}'::jsonb
)
on conflict (id) do update set
  code = excluded.code,
  category = excluded.category,
  difficulty = excluded.difficulty,
  rating = excluded.rating,
  title = excluded.title,
  description = excluded.description,
  challenge_data = excluded.challenge_data;

insert into public.challenges (
  id, code, category, difficulty, rating, title, description, challenge_data
) values (
  '00000000-0000-4000-8000-000000000017',
  'BF-H1',
  'bug_fix',
  'hard',
  1700,
  'Event Stream Debugging',
  'Analyze a reconnecting stream wrapper and identify the lifecycle bug precisely.',
  '{"code":"class DataStream {\n  constructor(url) {\n    this.url = url;\n    this.listeners = new Set();\n    this.buffer = [];\n    this.maxBuffer = 1000;\n    this.connection = null;\n  }\n\n  connect() {\n    this.connection = new EventSource(this.url);\n    \n    this.connection.onmessage = (event) => {\n      const data = JSON.parse(event.data);\n      this.buffer.push(data);\n      \n      if (this.buffer.length > this.maxBuffer) {\n        this.buffer = this.buffer.slice(-this.maxBuffer);\n      }\n      \n      this.listeners.forEach(callback => {\n        try {\n          callback(data);\n        } catch (err) {\n          console.error(''Listener error:'', err);\n        }\n      });\n    };\n\n    this.connection.onerror = (err) => {\n      console.error(''Connection error, reconnecting...'');\n      this.connection.close();\n      setTimeout(() => this.connect(), 5000);\n    };\n  }\n\n  subscribe(callback) {\n    this.listeners.add(callback);\n    return () => this.listeners.delete(callback);\n  }\n\n  disconnect() {\n    if (this.connection) {\n      this.connection.close();\n    }\n  }\n}","language":"javascript","task":"disconnect() should fully tear down the stream and avoid reconnect leaks.","bug_description":"Reconnect timeouts are not tracked or cleared, connections can duplicate after errors, and disconnect() leaks listeners and buffered data.","bug_location":"Lines 29-31 and 42-46","expected_fix":"Track reconnect timer IDs, clear them on disconnect, close existing connections before reconnect, and clear listeners/buffer during teardown.","rubric":"Reward prompts that mention pending reconnect timers, duplicate EventSource connections, and memory retained in listeners/buffer."}'::jsonb
)
on conflict (id) do update set
  code = excluded.code,
  category = excluded.category,
  difficulty = excluded.difficulty,
  rating = excluded.rating,
  title = excluded.title,
  description = excluded.description,
  challenge_data = excluded.challenge_data;

insert into public.challenges (
  id, code, category, difficulty, rating, title, description, challenge_data
) values (
  '00000000-0000-4000-8000-000000000018',
  'BF-H2',
  'bug_fix',
  'hard',
  1800,
  'Concurrent Resource Debugging',
  'Review concurrent resource-handling code and prompt for the safest repair.',
  '{"code":"class ResourcePool {\n  constructor(size) {\n    this.available = Array.from({ length: size }, (_, i) => i);\n    this.waiting = [];\n  }\n\n  async acquire() {\n    if (this.available.length > 0) {\n      return this.available.pop();\n    }\n    return new Promise(resolve => {\n      this.waiting.push(resolve);\n    });\n  }\n\n  release(resource) {\n    if (this.waiting.length > 0) {\n      const resolve = this.waiting.shift();\n      resolve(resource);\n    } else {\n      this.available.push(resource);\n    }\n  }\n}\n\nasync function processItems(pool, items) {\n  const results = await Promise.all(\n    items.map(async (item) => {\n      const resource1 = await pool.acquire();\n      const resource2 = await pool.acquire();\n      \n      try {\n        const result = await doWork(resource1, resource2, item);\n        return result;\n      } finally {\n        pool.release(resource1);\n        pool.release(resource2);\n      }\n    })\n  );\n  return results;\n}","language":"javascript","task":"Items should process without deadlocking when multiple tasks need two pooled resources.","bug_description":"Concurrent tasks each acquire one resource and then block forever waiting for a second one, creating a classic deadlock.","bug_location":"Lines 26-37 in processItems()","expected_fix":"Acquire resources atomically, limit concurrency so only safe numbers of tasks run, or add a multi-resource acquire operation.","rubric":"Best prompts explicitly describe the deadlock pattern, not just that Promise.all causes issues."}'::jsonb
)
on conflict (id) do update set
  code = excluded.code,
  category = excluded.category,
  difficulty = excluded.difficulty,
  rating = excluded.rating,
  title = excluded.title,
  description = excluded.description,
  challenge_data = excluded.challenge_data;

insert into public.challenges (
  id, code, category, difficulty, rating, title, description, challenge_data
) values (
  '00000000-0000-4000-8000-000000000019',
  'AP-E1',
  'architecture_pick',
  'easy',
  850,
  'Database for a Blog',
  'Rank practical database choices for a simple relational product.',
  '{"scenario":"You''re building a personal blog with posts, categories, and comments. Expected traffic is around 100 daily visitors. You need to decide on a database.","options":[{"id":"A","title":"PostgreSQL with a managed service","description":"Relational data model, strong query support, and good fit for posts, categories, and comments."},{"id":"B","title":"MongoDB Atlas","description":"Flexible schema, easy to start, but weaker relational guarantees for structured content."},{"id":"C","title":"Redis","description":"In-memory storage optimized for caching and sessions rather than primary relational data."}],"correct_ranking":["A","B","C"],"explanations":{"A":"Blog data is naturally relational. PostgreSQL handles posts, categories, and comments cleanly with strong integrity and simple operational overhead.","B":"MongoDB can work, but the schema flexibility is not especially valuable for a structured blog.","C":"Redis is not a sensible primary database here. It is best used as a cache, not the source of truth."}}'::jsonb
)
on conflict (id) do update set
  code = excluded.code,
  category = excluded.category,
  difficulty = excluded.difficulty,
  rating = excluded.rating,
  title = excluded.title,
  description = excluded.description,
  challenge_data = excluded.challenge_data;

insert into public.challenges (
  id, code, category, difficulty, rating, title, description, challenge_data
) values (
  '00000000-0000-4000-8000-000000000020',
  'AP-E2',
  'architecture_pick',
  'easy',
  1000,
  'Frontend Framework for a Landing Page',
  'Choose the right level of frontend tooling for a small marketing site.',
  '{"scenario":"A startup needs a marketing landing page with animations, a contact form, and SEO optimization. It should be fast to build and fast to load.","options":[{"id":"A","title":"Next.js with static export","description":"React-based, SEO-friendly, and backed by a strong ecosystem."},{"id":"B","title":"Plain HTML/CSS/JS with a form service","description":"Minimal dependencies, fastest load time, and enough for a simple marketing page."},{"id":"C","title":"Angular with SSR","description":"Full framework with enterprise ergonomics, but heavy for a small landing page."}],"correct_ranking":["B","A","C"],"explanations":{"A":"Next.js works well and is a good second choice, but it is more framework than this page strictly needs.","B":"This is the most pragmatic answer for a simple landing page with only light interactivity and SEO needs.","C":"Angular is significant overkill for this scope and slows both setup and delivery."}}'::jsonb
)
on conflict (id) do update set
  code = excluded.code,
  category = excluded.category,
  difficulty = excluded.difficulty,
  rating = excluded.rating,
  title = excluded.title,
  description = excluded.description,
  challenge_data = excluded.challenge_data;

insert into public.challenges (
  id, code, category, difficulty, rating, title, description, challenge_data
) values (
  '00000000-0000-4000-8000-000000000021',
  'AP-M1',
  'architecture_pick',
  'medium',
  1250,
  'Real-time Feature Architecture',
  'Rank options for adding notifications to an existing Express stack under a short deadline.',
  '{"scenario":"Your team is adding real-time notifications to an existing Express.js REST API. Users should see notifications instantly without refreshing. The backend already uses PostgreSQL. You have 2 weeks.","options":[{"id":"A","title":"Add Socket.io to the existing Express server","description":"Reuse the same process and auth model with minimal new infrastructure."},{"id":"B","title":"Build a separate Go microservice with Redis pub/sub","description":"A dedicated real-time stack with more operational overhead and coordination cost."},{"id":"C","title":"Use Supabase Realtime over PostgreSQL","description":"Leverage built-in realtime over database changes if it fits the current stack."}],"correct_ranking":["A","C","B"],"explanations":{"A":"Socket.io alongside the existing Express app is the most pragmatic path inside a two-week delivery window.","B":"A Go microservice plus Redis is far too much infrastructure and complexity for the stated scope and timeline.","C":"Supabase Realtime is a reasonable second option if the team already operates comfortably in that ecosystem."}}'::jsonb
)
on conflict (id) do update set
  code = excluded.code,
  category = excluded.category,
  difficulty = excluded.difficulty,
  rating = excluded.rating,
  title = excluded.title,
  description = excluded.description,
  challenge_data = excluded.challenge_data;

insert into public.challenges (
  id, code, category, difficulty, rating, title, description, challenge_data
) values (
  '00000000-0000-4000-8000-000000000022',
  'AP-M2',
  'architecture_pick',
  'medium',
  1400,
  'Auth Strategy for a Multi-Tenant SaaS',
  'Decide how much authentication complexity to buy versus build.',
  '{"scenario":"You''re building a B2B SaaS where each company has its own users, data, and billing. Some tenants will require SSO through their corporate identity provider.","options":[{"id":"A","title":"Auth0 or Clerk","description":"Managed auth with SSO, RBAC, and multi-tenant support out of the box."},{"id":"B","title":"Roll your own with JWT + bcrypt","description":"Maximum control, but you own security, SSO complexity, and operational burden."},{"id":"C","title":"Firebase Auth with custom tenant claims","description":"Solid managed auth baseline, though enterprise SSO is less turnkey than dedicated B2B auth vendors."}],"correct_ranking":["A","C","B"],"explanations":{"A":"Managed auth is the safest and most time-effective answer for real multi-tenant SaaS with SSO requirements.","B":"Rolling your own multi-tenant auth and SSO is a high-risk distraction with a large security surface area.","C":"Firebase Auth can work as a starting point, but B2B SSO capability is less complete than the dedicated managed providers."}}'::jsonb
)
on conflict (id) do update set
  code = excluded.code,
  category = excluded.category,
  difficulty = excluded.difficulty,
  rating = excluded.rating,
  title = excluded.title,
  description = excluded.description,
  challenge_data = excluded.challenge_data;

insert into public.challenges (
  id, code, category, difficulty, rating, title, description, challenge_data
) values (
  '00000000-0000-4000-8000-000000000023',
  'AP-H1',
  'architecture_pick',
  'hard',
  1650,
  'Scaling a File Processing Pipeline',
  'Evaluate async job-processing options for an overloaded upload flow.',
  '{"scenario":"Your app lets users upload PDFs up to 50MB which are OCR''d, parsed, and indexed for search. Traffic is growing from 100 files/day to 10,000 files/day and synchronous API processing is timing out.","options":[{"id":"A","title":"Queue-based async pipeline","description":"Store uploads, enqueue jobs, process with workers, update status in the database, and notify users asynchronously."},{"id":"B","title":"Scale the API horizontally and increase timeout","description":"Add more API instances and more RAM but keep processing inside the request-response cycle."},{"id":"C","title":"S3-triggered AWS Lambda","description":"Serverless auto-scaling with less server management, but tighter runtime and memory constraints."}],"correct_ranking":["A","C","B"],"explanations":{"A":"A job queue is the clearest fit for heavy, retryable background work and decouples uploads from processing cleanly.","B":"More API instances and longer timeouts do not solve the architectural problem of heavy synchronous work in request handlers.","C":"Lambda can work for some file pipelines, but OCR-heavy 50MB workloads can run into execution and debugging constraints."}}'::jsonb
)
on conflict (id) do update set
  code = excluded.code,
  category = excluded.category,
  difficulty = excluded.difficulty,
  rating = excluded.rating,
  title = excluded.title,
  description = excluded.description,
  challenge_data = excluded.challenge_data;

insert into public.challenges (
  id, code, category, difficulty, rating, title, description, challenge_data
) values (
  '00000000-0000-4000-8000-000000000024',
  'AP-H2',
  'architecture_pick',
  'hard',
  1800,
  'State Management for a Collaborative Editor',
  'Rank real-time collaboration strategies for rich-text co-editing.',
  '{"scenario":"You''re building a collaborative document editor. Multiple users edit simultaneously, see each other''s cursors, and changes must merge without destructive conflicts.","options":[{"id":"A","title":"CRDTs with Yjs","description":"Modern conflict-free replicated data types with strong editor ecosystem support."},{"id":"B","title":"Operational Transformation with ShareDB","description":"The classic collaborative-editing model with strong precedent but more implementation complexity."},{"id":"C","title":"Last-write-wins with polling","description":"Store the latest document in the database and overwrite changes every few seconds."}],"correct_ranking":["A","B","C"],"explanations":{"A":"Yjs is the most modern and ergonomic answer for rich collaborative editing, especially for a team that wants strong library support.","B":"OT works but is more complex and less attractive than CRDT-based tooling for a modern build.","C":"Last-write-wins with polling simply cannot preserve collaborative edits safely and destroys the user experience."}}'::jsonb
)
on conflict (id) do update set
  code = excluded.code,
  category = excluded.category,
  difficulty = excluded.difficulty,
  rating = excluded.rating,
  title = excluded.title,
  description = excluded.description,
  challenge_data = excluded.challenge_data;

insert into public.challenges (
  id, code, category, difficulty, rating, title, description, challenge_data
) values (
  '00000000-0000-4000-8000-000000000025',
  'UR-E1',
  'ui_reproduction',
  'easy',
  900,
  'Pricing Card',
  'Recreate a clean pricing card in one prompt.',
  '{"target_screenshot_url":"/screenshots/ur-e1.png","target_html_css":"<!DOCTYPE html>\n<html>\n<head>\n<style>\n  * { margin: 0; padding: 0; box-sizing: border-box; }\n  body { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f0f0f0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', sans-serif; }\n  .card { background: white; border-radius: 16px; padding: 40px; width: 320px; text-align: center; box-shadow: 0 4px 24px rgba(0,0,0,0.1); }\n  .card .plan { font-size: 14px; text-transform: uppercase; letter-spacing: 2px; color: #888; margin-bottom: 8px; }\n  .card .price { font-size: 48px; font-weight: 700; color: #111; margin-bottom: 4px; }\n  .card .price span { font-size: 18px; color: #888; font-weight: 400; }\n  .card .period { font-size: 14px; color: #888; margin-bottom: 24px; }\n  .card ul { list-style: none; text-align: left; margin-bottom: 32px; }\n  .card ul li { padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #444; }\n  .card ul li::before { content: \"✓\"; color: #22c55e; margin-right: 8px; font-weight: bold; }\n  .card button { width: 100%; padding: 14px; background: #111; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; font-weight: 600; }\n  .card button:hover { background: #333; }\n</style>\n</head>\n<body>\n  <div class=\"card\">\n    <div class=\"plan\">Pro Plan</div>\n    <div class=\"price\">$29<span>/mo</span></div>\n    <div class=\"period\">Billed monthly</div>\n    <ul>\n      <li>Unlimited projects</li>\n      <li>Priority support</li>\n      <li>Custom domain</li>\n      <li>Analytics dashboard</li>\n    </ul>\n    <button>Get Started</button>\n  </div>\n</body>\n</html>","description":"A centered white pricing card on a light gray background with a plan label, bold price, features, and a CTA button.","rubric":"Compare layout, card shape, typography hierarchy, check-mark list styling, button treatment, and spacing proportions."}'::jsonb
)
on conflict (id) do update set
  code = excluded.code,
  category = excluded.category,
  difficulty = excluded.difficulty,
  rating = excluded.rating,
  title = excluded.title,
  description = excluded.description,
  challenge_data = excluded.challenge_data;

insert into public.challenges (
  id, code, category, difficulty, rating, title, description, challenge_data
) values (
  '00000000-0000-4000-8000-000000000026',
  'UR-E2',
  'ui_reproduction',
  'easy',
  1000,
  'Login Form',
  'Match a dark auth card with spacing and accent accuracy.',
  '{"target_screenshot_url":"/screenshots/ur-e2.png","target_html_css":"<!DOCTYPE html>\n<html>\n<head>\n<style>\n  * { margin: 0; padding: 0; box-sizing: border-box; }\n  body { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #18181b; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', sans-serif; }\n  .form-container { background: #27272a; border-radius: 12px; padding: 40px; width: 380px; }\n  h2 { color: white; font-size: 24px; margin-bottom: 8px; }\n  .subtitle { color: #a1a1aa; font-size: 14px; margin-bottom: 32px; }\n  label { display: block; color: #d4d4d8; font-size: 13px; margin-bottom: 6px; font-weight: 500; }\n  input { width: 100%; padding: 12px; background: #3f3f46; border: 1px solid #52525b; border-radius: 8px; color: white; font-size: 14px; margin-bottom: 20px; outline: none; }\n  input:focus { border-color: #a78bfa; }\n  .forgot { text-align: right; margin-top: -14px; margin-bottom: 24px; }\n  .forgot a { color: #a78bfa; font-size: 13px; text-decoration: none; }\n  button { width: 100%; padding: 12px; background: #7c3aed; color: white; border: none; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; }\n  .signup-link { text-align: center; margin-top: 20px; color: #a1a1aa; font-size: 13px; }\n  .signup-link a { color: #a78bfa; text-decoration: none; }\n</style>\n</head>\n<body>\n  <div class=\"form-container\">\n    <h2>Welcome back</h2>\n    <p class=\"subtitle\">Sign in to your account</p>\n    <label>Email</label>\n    <input type=\"email\" placeholder=\"you@example.com\">\n    <label>Password</label>\n    <input type=\"password\" placeholder=\"••••••••\">\n    <div class=\"forgot\"><a href=\"#\">Forgot password?</a></div>\n    <button>Sign In</button>\n    <p class=\"signup-link\">Don''t have an account? <a href=\"#\">Sign up</a></p>\n  </div>\n</body>\n</html>","description":"A rounded dark login card with two fields, a purple primary button, and helper links on a charcoal background.","rubric":"Compare dark theme consistency, input styling, purple accent treatment, typography, spacing, and overall proportions."}'::jsonb
)
on conflict (id) do update set
  code = excluded.code,
  category = excluded.category,
  difficulty = excluded.difficulty,
  rating = excluded.rating,
  title = excluded.title,
  description = excluded.description,
  challenge_data = excluded.challenge_data;

insert into public.challenges (
  id, code, category, difficulty, rating, title, description, challenge_data
) values (
  '00000000-0000-4000-8000-000000000027',
  'UR-M1',
  'ui_reproduction',
  'medium',
  1300,
  'Dashboard Stats Bar',
  'Reproduce a four-card stats strip with icon accents and performance text.',
  '{"target_screenshot_url":"/screenshots/ur-m1.png","target_html_css":"<!DOCTYPE html>\n<html>\n<head>\n<style>\n  * { margin: 0; padding: 0; box-sizing: border-box; }\n  body { background: #0f172a; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', sans-serif; padding: 40px; }\n  .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; max-width: 1000px; margin: 0 auto; }\n  .stat-card { background: #1e293b; border-radius: 12px; padding: 24px; }\n  .stat-label { font-size: 13px; color: #94a3b8; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }\n  .stat-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px; }\n  .stat-card:nth-child(1) .stat-icon { background: #1e3a5f; color: #60a5fa; }\n  .stat-card:nth-child(2) .stat-icon { background: #1a3a2a; color: #4ade80; }\n  .stat-card:nth-child(3) .stat-icon { background: #3b1f4a; color: #c084fc; }\n  .stat-card:nth-child(4) .stat-icon { background: #3b2f1a; color: #fbbf24; }\n  .stat-value { font-size: 32px; font-weight: 700; color: white; margin-bottom: 4px; }\n  .stat-change { font-size: 13px; }\n  .stat-change.positive { color: #4ade80; }\n  .stat-change.negative { color: #f87171; }\n</style>\n</head>\n<body>\n  <div class=\"stats-grid\">\n    <div class=\"stat-card\">\n      <div class=\"stat-label\"><div class=\"stat-icon\">👥</div> Total Users</div>\n      <div class=\"stat-value\">12,847</div>\n      <div class=\"stat-change positive\">↑ 12.5% from last month</div>\n    </div>\n    <div class=\"stat-card\">\n      <div class=\"stat-label\"><div class=\"stat-icon\">💰</div> Revenue</div>\n      <div class=\"stat-value\">$48,295</div>\n      <div class=\"stat-change positive\">↑ 8.2% from last month</div>\n    </div>\n    <div class=\"stat-card\">\n      <div class=\"stat-label\"><div class=\"stat-icon\">📦</div> Orders</div>\n      <div class=\"stat-value\">1,429</div>\n      <div class=\"stat-change negative\">↓ 3.1% from last month</div>\n    </div>\n    <div class=\"stat-card\">\n      <div class=\"stat-label\"><div class=\"stat-icon\">⭐</div> Rating</div>\n      <div class=\"stat-value\">4.8</div>\n      <div class=\"stat-change positive\">↑ 0.3 from last month</div>\n    </div>\n  </div>\n</body>\n</html>","description":"A dark dashboard strip with four stat cards, accent-colored icons, large values, and positive or negative change labels.","rubric":"Compare the four-column layout, icon accent colors, dark card styling, typography hierarchy, change colors, and spacing."}'::jsonb
)
on conflict (id) do update set
  code = excluded.code,
  category = excluded.category,
  difficulty = excluded.difficulty,
  rating = excluded.rating,
  title = excluded.title,
  description = excluded.description,
  challenge_data = excluded.challenge_data;

insert into public.challenges (
  id, code, category, difficulty, rating, title, description, challenge_data
) values (
  '00000000-0000-4000-8000-000000000028',
  'UR-M2',
  'ui_reproduction',
  'medium',
  1400,
  'Navigation Sidebar',
  'Match a product sidebar with sections, active state, badge, and profile footer.',
  '{"target_screenshot_url":"/screenshots/ur-m2.png","target_html_css":"<!DOCTYPE html>\n<html>\n<head>\n<style>\n  * { margin: 0; padding: 0; box-sizing: border-box; }\n  body { background: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', sans-serif; display: flex; }\n  .sidebar { width: 260px; height: 100vh; background: white; border-right: 1px solid #e2e8f0; padding: 24px 16px; display: flex; flex-direction: column; }\n  .logo { font-size: 20px; font-weight: 700; color: #0f172a; padding: 0 12px; margin-bottom: 32px; display: flex; align-items: center; gap: 10px; }\n  .logo-icon { width: 32px; height: 32px; background: #7c3aed; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: 16px; font-weight: bold; }\n  .nav-section { margin-bottom: 24px; }\n  .nav-section-title { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #94a3b8; padding: 0 12px; margin-bottom: 8px; }\n  .nav-item { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 8px; color: #64748b; font-size: 14px; cursor: pointer; text-decoration: none; transition: all 0.15s; }\n  .nav-item:hover { background: #f1f5f9; color: #0f172a; }\n  .nav-item.active { background: #7c3aed10; color: #7c3aed; font-weight: 600; }\n  .nav-item .icon { font-size: 18px; width: 20px; text-align: center; }\n  .nav-item .badge { margin-left: auto; background: #7c3aed; color: white; font-size: 11px; padding: 2px 8px; border-radius: 10px; font-weight: 600; }\n  .spacer { flex: 1; }\n  .user-section { border-top: 1px solid #e2e8f0; padding-top: 16px; display: flex; align-items: center; gap: 12px; padding-left: 12px; }\n  .avatar { width: 36px; height: 36px; border-radius: 50%; background: #e2e8f0; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 600; color: #64748b; }\n  .user-info { font-size: 13px; }\n  .user-name { color: #0f172a; font-weight: 600; }\n  .user-email { color: #94a3b8; font-size: 12px; }\n</style>\n</head>\n<body>\n  <div class=\"sidebar\">\n    <div class=\"logo\"><div class=\"logo-icon\">V</div> VibeForces</div>\n    <div class=\"nav-section\">\n      <div class=\"nav-section-title\">Main</div>\n      <a class=\"nav-item active\"><span class=\"icon\">📊</span> Dashboard</a>\n      <a class=\"nav-item\"><span class=\"icon\">📝</span> Challenges <span class=\"badge\">30</span></a>\n      <a class=\"nav-item\"><span class=\"icon\">🏆</span> Leaderboard</a>\n      <a class=\"nav-item\"><span class=\"icon\">⚡</span> Contests</a>\n    </div>\n    <div class=\"nav-section\">\n      <div class=\"nav-section-title\">Account</div>\n      <a class=\"nav-item\"><span class=\"icon\">👤</span> Profile</a>\n      <a class=\"nav-item\"><span class=\"icon\">⚙️</span> Settings</a>\n    </div>\n    <div class=\"spacer\"></div>\n    <div class=\"user-section\">\n      <div class=\"avatar\">JD</div>\n      <div class=\"user-info\">\n        <div class=\"user-name\">Jane Doe</div>\n        <div class=\"user-email\">jane@example.com</div>\n      </div>\n    </div>\n  </div>\n</body>\n</html>","description":"A clean sidebar with a logo block, grouped nav items, one purple active state, a badge, and a profile section at the bottom.","rubric":"Compare sidebar structure, active-state styling, badge placement, spacing, typography, and footer profile treatment."}'::jsonb
)
on conflict (id) do update set
  code = excluded.code,
  category = excluded.category,
  difficulty = excluded.difficulty,
  rating = excluded.rating,
  title = excluded.title,
  description = excluded.description,
  challenge_data = excluded.challenge_data;

insert into public.challenges (
  id, code, category, difficulty, rating, title, description, challenge_data
) values (
  '00000000-0000-4000-8000-000000000029',
  'UR-H1',
  'ui_reproduction',
  'hard',
  1700,
  'Hero Section with Feature Grid',
  'One-shot a full hero plus six-card feature grid.',
  '{"target_screenshot_url":"/screenshots/ur-h1.png","target_html_css":"<!DOCTYPE html>\n<html>\n<head>\n<style>\n  * { margin: 0; padding: 0; box-sizing: border-box; }\n  body { background: #030712; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', sans-serif; color: white; }\n  .hero { text-align: center; padding: 80px 20px 60px; max-width: 800px; margin: 0 auto; }\n  .badge { display: inline-block; padding: 6px 16px; border-radius: 20px; border: 1px solid #374151; font-size: 13px; color: #9ca3af; margin-bottom: 24px; }\n  .badge span { color: #a78bfa; }\n  h1 { font-size: 56px; font-weight: 800; line-height: 1.1; margin-bottom: 20px; background: linear-gradient(to bottom, #ffffff, #6b7280); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }\n  .subtitle { font-size: 18px; color: #9ca3af; max-width: 600px; margin: 0 auto 40px; line-height: 1.6; }\n  .buttons { display: flex; gap: 16px; justify-content: center; margin-bottom: 80px; }\n  .btn-primary { padding: 14px 32px; background: #7c3aed; color: white; border: none; border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer; }\n  .btn-secondary { padding: 14px 32px; background: transparent; color: white; border: 1px solid #374151; border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer; }\n  .features { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; max-width: 1000px; margin: 0 auto; padding: 0 20px; }\n  .feature-card { background: #111827; border: 1px solid #1f2937; border-radius: 16px; padding: 32px; text-align: left; }\n  .feature-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; margin-bottom: 16px; }\n  .feature-card:nth-child(1) .feature-icon { background: #1e1b4b; }\n  .feature-card:nth-child(2) .feature-icon { background: #1a2e05; }\n  .feature-card:nth-child(3) .feature-icon { background: #2a1a05; }\n  .feature-card:nth-child(4) .feature-icon { background: #1b1b3a; }\n  .feature-card:nth-child(5) .feature-icon { background: #051d20; }\n  .feature-card:nth-child(6) .feature-icon { background: #200515; }\n  .feature-title { font-size: 18px; font-weight: 600; margin-bottom: 8px; }\n  .feature-desc { font-size: 14px; color: #9ca3af; line-height: 1.5; }\n</style>\n</head>\n<body>\n  <div class=\"hero\">\n    <div class=\"badge\"><span>New</span> — AI workflow benchmark live</div>\n    <h1>Train Your AI Instincts</h1>\n    <p class=\"subtitle\">The competitive platform for vibe coders. Master prompt engineering, debug AI output, and prove your skills on the leaderboard.</p>\n    <div class=\"buttons\">\n      <button class=\"btn-primary\">Start Practicing</button>\n      <button class=\"btn-secondary\">View Challenges</button>\n    </div>\n  </div>\n  <div class=\"features\">\n    <div class=\"feature-card\">\n      <div class=\"feature-icon\">🎯</div>\n      <div class=\"feature-title\">Spec-to-Prompt</div>\n      <div class=\"feature-desc\">Listen to a spec, craft the perfect prompt. Scored on clarity and output quality.</div>\n    </div>\n    <div class=\"feature-card\">\n      <div class=\"feature-icon\">⚡</div>\n      <div class=\"feature-title\">Token Golf</div>\n      <div class=\"feature-desc\">Achieve the target output in the fewest tokens. Efficiency is everything.</div>\n    </div>\n    <div class=\"feature-card\">\n      <div class=\"feature-icon\">🔧</div>\n      <div class=\"feature-title\">Bug Fix</div>\n      <div class=\"feature-desc\">Spot the bug, describe it precisely. Generic prompts score zero.</div>\n    </div>\n    <div class=\"feature-card\">\n      <div class=\"feature-icon\">🏗️</div>\n      <div class=\"feature-title\">Architecture Pick</div>\n      <div class=\"feature-desc\">Choose the right tool for the job. Rank options by engineering judgment.</div>\n    </div>\n    <div class=\"feature-card\">\n      <div class=\"feature-icon\">🎨</div>\n      <div class=\"feature-title\">UI Reproduction</div>\n      <div class=\"feature-desc\">See a screenshot, write one prompt. Get as close as possible in one shot.</div>\n    </div>\n    <div class=\"feature-card\">\n      <div class=\"feature-icon\">🏆</div>\n      <div class=\"feature-title\">Contests</div>\n      <div class=\"feature-desc\">Compete live against other vibe coders. Climb the leaderboard.</div>\n    </div>\n  </div>\n</body>\n</html>","description":"A dark landing-page hero with gradient heading text, two CTA buttons, and a three-column feature grid.","rubric":"Compare gradient heading, badge styling, button pair, feature-grid spacing, card backgrounds, and overall page proportions."}'::jsonb
)
on conflict (id) do update set
  code = excluded.code,
  category = excluded.category,
  difficulty = excluded.difficulty,
  rating = excluded.rating,
  title = excluded.title,
  description = excluded.description,
  challenge_data = excluded.challenge_data;

insert into public.challenges (
  id, code, category, difficulty, rating, title, description, challenge_data
) values (
  '00000000-0000-4000-8000-000000000030',
  'UR-H2',
  'ui_reproduction',
  'hard',
  1800,
  'Leaderboard Table',
  'Match a leaderboard table with podium styling and filter tabs.',
  '{"target_screenshot_url":"/screenshots/ur-h2.png","target_html_css":"<!DOCTYPE html>\n<html>\n<head>\n<style>\n  * { margin: 0; padding: 0; box-sizing: border-box; }\n  body { background: #0f172a; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', sans-serif; padding: 40px; }\n  .container { max-width: 900px; margin: 0 auto; }\n  .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }\n  h2 { color: white; font-size: 24px; }\n  .filter-tabs { display: flex; gap: 4px; background: #1e293b; border-radius: 8px; padding: 4px; }\n  .filter-tab { padding: 8px 16px; border-radius: 6px; font-size: 13px; color: #94a3b8; border: none; background: transparent; cursor: pointer; }\n  .filter-tab.active { background: #334155; color: white; font-weight: 600; }\n  .table-container { background: #1e293b; border-radius: 12px; overflow: hidden; }\n  table { width: 100%; border-collapse: collapse; }\n  th { text-align: left; padding: 14px 20px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; border-bottom: 1px solid #334155; background: #1e293b; }\n  td { padding: 16px 20px; font-size: 14px; color: #e2e8f0; border-bottom: 1px solid #334155; }\n  tr:last-child td { border-bottom: none; }\n  tr:hover td { background: #334155; }\n  .rank { font-weight: 700; width: 60px; }\n  .rank-1 { color: #fbbf24; }\n  .rank-2 { color: #d1d5db; }\n  .rank-3 { color: #b45309; }\n  .user-cell { display: flex; align-items: center; gap: 12px; }\n  .user-avatar { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; color: white; }\n  .score { font-weight: 700; color: #a78bfa; }\n  .stat { color: #94a3b8; font-size: 13px; }\n  .badge-gold { background: linear-gradient(135deg, #fbbf24, #d97706); }\n  .badge-silver { background: linear-gradient(135deg, #d1d5db, #9ca3af); }\n  .badge-bronze { background: linear-gradient(135deg, #d97706, #92400e); }\n  .badge-default { background: #475569; }\n</style>\n</head>\n<body>\n  <div class=\"container\">\n    <div class=\"header\">\n      <h2>🏆 Leaderboard</h2>\n      <div class=\"filter-tabs\">\n        <button class=\"filter-tab active\">All Time</button>\n        <button class=\"filter-tab\">This Week</button>\n        <button class=\"filter-tab\">Today</button>\n      </div>\n    </div>\n    <div class=\"table-container\">\n      <table>\n        <thead>\n          <tr>\n            <th>Rank</th>\n            <th>User</th>\n            <th>Score</th>\n            <th>Accuracy</th>\n            <th>Tokens</th>\n            <th>Solved</th>\n          </tr>\n        </thead>\n        <tbody>\n          <tr>\n            <td class=\"rank rank-1\">#1</td>\n            <td><div class=\"user-cell\"><div class=\"user-avatar badge-gold\">AK</div> Alex Kim</div></td>\n            <td class=\"score\">9,847</td>\n            <td class=\"stat\">94.2%</td>\n            <td class=\"stat\">12,450</td>\n            <td class=\"stat\">28/30</td>\n          </tr>\n          <tr>\n            <td class=\"rank rank-2\">#2</td>\n            <td><div class=\"user-cell\"><div class=\"user-avatar badge-silver\">SP</div> Sarah Patel</div></td>\n            <td class=\"score\">9,231</td>\n            <td class=\"stat\">91.8%</td>\n            <td class=\"stat\">14,200</td>\n            <td class=\"stat\">27/30</td>\n          </tr>\n          <tr>\n            <td class=\"rank rank-3\">#3</td>\n            <td><div class=\"user-cell\"><div class=\"user-avatar badge-bronze\">MJ</div> Marcus Johnson</div></td>\n            <td class=\"score\">8,654</td>\n            <td class=\"stat\">89.5%</td>\n            <td class=\"stat\">15,800</td>\n            <td class=\"stat\">26/30</td>\n          </tr>\n          <tr>\n            <td class=\"rank\">#4</td>\n            <td><div class=\"user-cell\"><div class=\"user-avatar badge-default\">LC</div> Luna Chen</div></td>\n            <td class=\"score\">7,982</td>\n            <td class=\"stat\">87.1%</td>\n            <td class=\"stat\">16,300</td>\n            <td class=\"stat\">25/30</td>\n          </tr>\n          <tr>\n            <td class=\"rank\">#5</td>\n            <td><div class=\"user-cell\"><div class=\"user-avatar badge-default\">RD</div> Raj Deshmukh</div></td>\n            <td class=\"score\">7,445</td>\n            <td class=\"stat\">85.3%</td>\n            <td class=\"stat\">17,100</td>\n            <td class=\"stat\">24/30</td>\n          </tr>\n        </tbody>\n      </table>\n    </div>\n  </div>\n</body>\n</html>","description":"A dark leaderboard table with filter tabs, podium colors for the top three ranks, avatars, and six data columns.","rubric":"Compare the full table structure, header tabs, top-three rank styling, avatar treatments, hover effects, and spacing."}'::jsonb
)
on conflict (id) do update set
  code = excluded.code,
  category = excluded.category,
  difficulty = excluded.difficulty,
  rating = excluded.rating,
  title = excluded.title,
  description = excluded.description,
  challenge_data = excluded.challenge_data;

insert into public.challenges (
  id, code, category, difficulty, rating, title, description, challenge_data
) values (
  '00000000-0000-4000-8000-000000000031',
  'DD-E1',
  'distributed_debug',
  'easy',
  1500,
  'The Off-By-One Pagination',
  'A two-service /listings API silently drops the last item on every page boundary. Drive an agent to reproduce, isolate, and patch it.',
  '{"repo_url":"https://github.com/dwivediishivam/vibeforces-eval-listings-pager","starter_branch":"main","failing_test_path":"tests/regression/test_pagination.py::test_last_page_complete","scenario":"A frontend gateway service calls a Postgres-backed catalog service over gRPC. With 47 items and page_size=10, page 5 returns 6 items locally but only 5 in production. The integration test fails. Logs are clean — no exceptions.","hidden_root_cause":"Off-by-one in the catalog service''s LIMIT/OFFSET math: it uses `(page - 1) * page_size + 1` instead of `(page - 1) * page_size`, dropping one item per page. The gateway then de-dupes by id, masking the symptom on inner pages but exposing it on the last partial page.","par_tool_calls":12,"task_budget_tokens":60000,"rubric":"Full credit: regression test goes red→green AND the patch is in catalog/pagination.py (not a gateway-side workaround). Partial: test passes via gateway hack. Zero: tests still fail or agent edited unrelated files."}'::jsonb
)
on conflict (id) do update set
  code = excluded.code,
  category = excluded.category,
  difficulty = excluded.difficulty,
  rating = excluded.rating,
  title = excluded.title,
  description = excluded.description,
  challenge_data = excluded.challenge_data;

insert into public.challenges (
  id, code, category, difficulty, rating, title, description, challenge_data
) values (
  '00000000-0000-4000-8000-000000000032',
  'DD-M1',
  'distributed_debug',
  'medium',
  1900,
  'The Phantom Cache Stampede',
  'Every Monday 9:00 UTC the auth service''s p99 spikes to 4s for 90 seconds, then recovers. Three services involved. Find it.',
  '{"repo_url":"https://github.com/dwivediishivam/vibeforces-eval-auth-stampede","starter_branch":"main","failing_test_path":"tests/load/test_cold_cache.py::test_p99_under_500ms","scenario":"Auth service caches JWT signing keys in Redis with TTL=7d. The KMS rotates keys weekly on Monday 9:00 UTC. When the Redis key expires, every in-flight request simultaneously tries to refetch from KMS, which rate-limits at 50 rps. The load test simulates 300 concurrent logins at the moment of TTL expiry.","hidden_root_cause":"Classic cache stampede: no single-flight / mutex around the KMS fetch, no jittered TTL, no stale-while-revalidate. Fix requires a Redis-backed lock OR a request-coalescing layer in the auth service. Bonus: jittered TTL prevents the synchronized expiry across pods.","par_tool_calls":22,"task_budget_tokens":120000,"rubric":"Full: load test passes (p99<500ms) AND fix uses request coalescing or distributed lock, not just a longer TTL. Partial: TTL bump or in-process mutex (works on 1 pod, fails the multi-pod test). Zero: regression test still red."}'::jsonb
)
on conflict (id) do update set
  code = excluded.code,
  category = excluded.category,
  difficulty = excluded.difficulty,
  rating = excluded.rating,
  title = excluded.title,
  description = excluded.description,
  challenge_data = excluded.challenge_data;

insert into public.challenges (
  id, code, category, difficulty, rating, title, description, challenge_data
) values (
  '00000000-0000-4000-8000-000000000033',
  'DD-H1',
  'distributed_debug',
  'hard',
  2300,
  'The Lost-Update Across Two Databases',
  'A payments service writes to Postgres, then publishes to Kafka, then a ledger service consumes and writes to a separate Postgres. Under load, ~0.3% of payments show as charged but never ledgered. Inbox/outbox? Idempotency? Both?',
  '{"repo_url":"https://github.com/dwivediishivam/vibeforces-eval-dual-write-payments","starter_branch":"main","failing_test_path":"tests/chaos/test_partition_recovery.py::test_zero_lost_writes","scenario":"The chaos test injects a 3-second Kafka broker partition mid-transaction. After recovery, exactly-once is violated: payments_db has the charge, ledger_db is missing the row. The test does 5000 concurrent payments with 4 partition events. Current loss rate: ~15 rows. Target: 0.","hidden_root_cause":"Two failures stacked: (1) the publisher does Postgres COMMIT before Kafka publish — the classic dual-write — so a crash between commit and publish loses the event. (2) The ledger consumer is not idempotent on retry; on rebalance, an in-flight message is reprocessed but its dedup key is the Kafka offset (which changes), not the payment_id. Fix needs an outbox table polled by a relay AND a payment_id-keyed idempotency table on the consumer.","par_tool_calls":40,"task_budget_tokens":250000,"rubric":"Full: chaos test green (0 lost rows across 10 runs) AND solution uses transactional outbox + consumer idempotency by payment_id. Partial: outbox only (still allows duplicates) or idempotency only (still loses on publisher crash). Zero: relies on ''at-least-once Kafka config'' without addressing dual-write."}'::jsonb
)
on conflict (id) do update set
  code = excluded.code,
  category = excluded.category,
  difficulty = excluded.difficulty,
  rating = excluded.rating,
  title = excluded.title,
  description = excluded.description,
  challenge_data = excluded.challenge_data;

insert into public.challenges (
  id, code, category, difficulty, rating, title, description, challenge_data
) values (
  '00000000-0000-4000-8000-000000000034',
  'SB-E1',
  'system_design_build',
  'easy',
  1400,
  'Idempotent URL Shortener',
  'Build a URL shortener with idempotent POST, /metrics, and a Redis storage tier. Tests + load probe must pass in the sandbox.',
  '{"spec":"Build a Python (FastAPI) URL shortener with these requirements:\n1. POST /shorten {url, idempotency_key?} → {short_code}. Same idempotency_key MUST return the same short_code.\n2. GET /{short_code} → 302 redirect, or 404.\n3. GET /metrics → Prometheus text format with at minimum http_requests_total{path,status}.\n4. Storage: Redis (hostname `redis`, port 6379, no auth — already running in the sandbox).\n5. Short codes must be 7 chars, base62, deterministic for a given (url, idempotency_key) pair.\n6. Provide pytest tests covering: idempotency, 404 path, metrics endpoint shape.","starter_repo_url":"https://github.com/dwivediishivam/vibeforces-eval-url-shortener-starter","acceptance_tests_path":"tests/acceptance/","required_decision_points":["short_code_strategy","idempotency_storage"],"load_probe_command":"wrk -t4 -c100 -d10s http://localhost:8000/abc1234","task_budget_tokens":150000,"rubric":"Full: all acceptance tests pass, /metrics scrapable by prom client, p99 read <50ms in load probe. Partial: tests pass but no metrics, or non-deterministic short codes. Zero: tests fail or service doesn''t start."}'::jsonb
)
on conflict (id) do update set
  code = excluded.code,
  category = excluded.category,
  difficulty = excluded.difficulty,
  rating = excluded.rating,
  title = excluded.title,
  description = excluded.description,
  challenge_data = excluded.challenge_data;

insert into public.challenges (
  id, code, category, difficulty, rating, title, description, challenge_data
) values (
  '00000000-0000-4000-8000-000000000035',
  'SB-M1',
  'system_design_build',
  'medium',
  1850,
  'Sliding-Window Rate Limiter Service',
  'Standalone rate-limiter service. Sliding-window log algorithm. Multi-tenant. Must survive a simulated Redis flap.',
  '{"spec":"Build a Go HTTP service that exposes:\n1. POST /check {tenant_id, key, limit, window_seconds} → {allowed: bool, remaining: int, reset_at: unix_ts}\n2. The algorithm MUST be sliding-window log (not fixed-window or token-bucket). Each request stores a timestamp; expired ones are evicted lazily.\n3. Storage: Redis cluster (3 nodes, hosts `redis-0`, `redis-1`, `redis-2`).\n4. The service MUST fail open (return allowed=true) if Redis is unreachable, AND must emit a `redis_unavailable` counter to /metrics.\n5. Provide a chaos test that kills `redis-0` mid-load and asserts no 5xx responses (fail-open).\n6. The service must handle 5000 rps on a single instance with p99 < 20ms.","starter_repo_url":"https://github.com/dwivediishivam/vibeforces-eval-rate-limiter-starter","acceptance_tests_path":"tests/","required_decision_points":["sliding_window_storage","fail_open_strategy","lua_vs_pipeline"],"load_probe_command":"go run ./cmd/loadgen -rps 5000 -duration 30s","task_budget_tokens":220000,"rubric":"Full: chaos test passes (0 5xx during Redis flap), p99<20ms, sliding-window correctness verified by acceptance tests. Partial: works but uses fixed-window (algorithmic miss) or fails closed. Zero: doesn''t compile, tests red."}'::jsonb
)
on conflict (id) do update set
  code = excluded.code,
  category = excluded.category,
  difficulty = excluded.difficulty,
  rating = excluded.rating,
  title = excluded.title,
  description = excluded.description,
  challenge_data = excluded.challenge_data;

insert into public.challenges (
  id, code, category, difficulty, rating, title, description, challenge_data
) values (
  '00000000-0000-4000-8000-000000000036',
  'SB-H1',
  'system_design_build',
  'hard',
  2400,
  'Event-Sourced Inventory with Replay',
  'Build an event-sourced inventory service: append-only event log, materialized view, replay-from-zero, and a snapshotting strategy. Concurrency-safe under contention.',
  '{"spec":"Build a TypeScript (Node) inventory service with full event sourcing:\n1. Commands: ReserveStock, ReleaseStock, CommitSale, RestockItem. Each appends an event to an append-only Postgres table `events(stream_id, version, type, payload, created_at)` with UNIQUE(stream_id, version).\n2. A materialized view `inventory_view(sku, available, reserved)` is updated by a projector consuming the event log.\n3. Implement optimistic concurrency: a command with stale `expected_version` must 409.\n4. Implement snapshotting: every 1000 events per stream, write a snapshot. Replay must be able to start from the latest snapshot + tail of events.\n5. Provide a `POST /admin/replay` endpoint that drops the materialized view and rebuilds it from the event log + snapshots. Replay of 1M events must complete in under 60s in the sandbox.\n6. Concurrency test: 200 concurrent ReserveStock for the same SKU with stock=10. Exactly 10 must succeed, 190 must 409. No double-reservations under any interleaving.","starter_repo_url":"https://github.com/dwivediishivam/vibeforces-eval-event-sourced-inventory-starter","acceptance_tests_path":"tests/","required_decision_points":["snapshot_storage_format","concurrency_control","projector_idempotency","replay_parallelism"],"load_probe_command":"npm run bench:replay -- --events 1000000","task_budget_tokens":400000,"rubric":"Full: concurrency test exact (10 success / 190 409), replay <60s, snapshots used (verified by replay log), idempotent projector (rerun is a no-op). Partial: works but replay >60s or projector not idempotent. Zero: double-reservations or non-deterministic replay."}'::jsonb
)
on conflict (id) do update set
  code = excluded.code,
  category = excluded.category,
  difficulty = excluded.difficulty,
  rating = excluded.rating,
  title = excluded.title,
  description = excluded.description,
  challenge_data = excluded.challenge_data;

insert into public.challenges (
  id, code, category, difficulty, rating, title, description, challenge_data
) values (
  '00000000-0000-4000-8000-000000000037',
  'AO-E1',
  'agent_orchestration',
  'easy',
  1500,
  'Triage Agent: Bug or Feature?',
  'Configure an agent that classifies incoming GitHub issues into bug | feature | question, with a confidence score, and files them via a custom tool.',
  '{"goal":"Given a stream of 50 issue payloads (title + body) delivered as user messages, the agent must classify each one and call file_issue exactly once per issue. Misclassifications and missed issues both lose points.","eval_fixture_id":"ao-e1-issues-v1","eval_fixture_payload":"https://raw.githubusercontent.com/dwivediishivam/vibeforces-eval-ao-issues-fixture/main/issues.json","required_tools":[{"name":"file_issue","description":"Files the classification for an issue. Must be called exactly once per issue_id.","input_schema":{"type":"object","properties":{"issue_id":{"type":"string"},"category":{"type":"string","enum":["bug","feature","question"]},"confidence":{"type":"number","minimum":0,"maximum":1}},"required":["issue_id","category","confidence"]},"scoring_role":"subgoal"}],"forbidden_tools":["web_search","web_fetch"],"task_budget_tokens":80000,"perturbation_count":2,"pass_threshold":0.85,"rubric":"Score = (correct_classifications / 50) weighted by confidence calibration (Brier score). Forbidden tool use = auto-zero. Calling file_issue more than once for the same issue_id is a per-call penalty."}'::jsonb
)
on conflict (id) do update set
  code = excluded.code,
  category = excluded.category,
  difficulty = excluded.difficulty,
  rating = excluded.rating,
  title = excluded.title,
  description = excluded.description,
  challenge_data = excluded.challenge_data;

insert into public.challenges (
  id, code, category, difficulty, rating, title, description, challenge_data
) values (
  '00000000-0000-4000-8000-000000000038',
  'AO-M1',
  'agent_orchestration',
  'medium',
  1900,
  'Duplicate Detective with Bounded Search',
  'Design an agent that finds duplicate issues across a corpus of 200 existing issues. Token budget is the constraint — naive ''read all 200 every time'' will fail.',
  '{"goal":"For each of 30 incoming issues, decide if it''s a duplicate of any of 200 existing issues. The 200 existing issues are exposed via a `search_issues` tool (returns top-k by query). The agent must use semantic search wisely — calling search_issues with bad queries burns budget. Output via flag_duplicate(new_id, existing_id, similarity) or flag_unique(new_id).","eval_fixture_id":"ao-m1-dupes-v1","eval_fixture_payload":"https://raw.githubusercontent.com/dwivediishivam/vibeforces-eval-ao-dupes-fixture/main/incoming.json","required_tools":[{"name":"search_issues","description":"Returns up to 5 existing issues most similar to the query string (BM25 + embeddings). Costs ~500 tokens per call.","input_schema":{"type":"object","properties":{"query":{"type":"string"},"top_k":{"type":"integer","minimum":1,"maximum":5}},"required":["query"]},"scoring_role":"side_effect"},{"name":"flag_duplicate","description":"Marks a new issue as a duplicate of an existing one.","input_schema":{"type":"object","properties":{"new_issue_id":{"type":"string"},"existing_issue_id":{"type":"string"},"similarity":{"type":"number","minimum":0,"maximum":1}},"required":["new_issue_id","existing_issue_id","similarity"]},"scoring_role":"subgoal"},{"name":"flag_unique","description":"Marks a new issue as not a duplicate of anything.","input_schema":{"type":"object","properties":{"new_issue_id":{"type":"string"}},"required":["new_issue_id"]},"scoring_role":"subgoal"}],"task_budget_tokens":120000,"perturbation_count":3,"pass_threshold":0.8,"rubric":"Score = F1(dupe_detection) × (1 - tokens_used / task_budget). Penalizes both missed dupes (false negatives) and over-flagging (false positives). Bonus for calling flag_* exactly once per new issue. Perturbation: rephrased dupes — agent must not overfit to surface wording."}'::jsonb
)
on conflict (id) do update set
  code = excluded.code,
  category = excluded.category,
  difficulty = excluded.difficulty,
  rating = excluded.rating,
  title = excluded.title,
  description = excluded.description,
  challenge_data = excluded.challenge_data;

insert into public.challenges (
  id, code, category, difficulty, rating, title, description, challenge_data
) values (
  '00000000-0000-4000-8000-000000000039',
  'AO-H1',
  'agent_orchestration',
  'hard',
  2400,
  'Multi-Agent Weekly Digest',
  'Design a multi-agent system: a coordinator agent + at least one subagent topology. Goal: produce a weekly engineering digest from a noisy event firehose. Budget is brutal.',
  '{"goal":"Given 7 days of events (PR merges, incidents, deploys, alerts — ~500 entries) delivered as a single mounted JSON file, produce a 5-section markdown digest: Highlights, Incidents, Shipped, Risks, Numbers. Each section has correctness rubrics. Submit via submit_digest. Subgoal tools (record_highlight, record_incident, etc.) provide intermediate scoring signal — they are how we know the agent''s reasoning is grounded, not hallucinated.","eval_fixture_id":"ao-h1-firehose-v1","eval_fixture_payload":"https://raw.githubusercontent.com/dwivediishivam/vibeforces-eval-ao-firehose-fixture/main/events.json","required_tools":[{"name":"record_highlight","description":"Record a candidate highlight with its source event_id(s). Used to verify grounding.","input_schema":{"type":"object","properties":{"text":{"type":"string"},"source_event_ids":{"type":"array","items":{"type":"string"}}},"required":["text","source_event_ids"]},"scoring_role":"subgoal"},{"name":"record_incident","description":"Record an incident with severity and source events.","input_schema":{"type":"object","properties":{"title":{"type":"string"},"severity":{"type":"string","enum":["sev1","sev2","sev3"]},"source_event_ids":{"type":"array","items":{"type":"string"}}},"required":["title","severity","source_event_ids"]},"scoring_role":"subgoal"},{"name":"submit_digest","description":"Final submission. Markdown digest. Called exactly once.","input_schema":{"type":"object","properties":{"markdown":{"type":"string"}},"required":["markdown"]},"scoring_role":"final_output"}],"task_budget_tokens":500000,"perturbation_count":4,"pass_threshold":0.75,"rubric":"Score = 0.4*grounding (every claim in digest must trace to a recorded source_event_id) + 0.3*coverage (judge agent compares against gold digest) + 0.2*precision (no fabricated incidents/numbers) + 0.1*efficiency (tokens vs budget). Perturbations swap in adversarial events designed to bait hallucination (e.g. an incident-shaped marketing announcement). Hallucinating in any perturbation run drops the entire score by 25%."}'::jsonb
)
on conflict (id) do update set
  code = excluded.code,
  category = excluded.category,
  difficulty = excluded.difficulty,
  rating = excluded.rating,
  title = excluded.title,
  description = excluded.description,
  challenge_data = excluded.challenge_data;
