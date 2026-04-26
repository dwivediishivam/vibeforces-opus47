import type {
  ArchitecturePickData,
  BugFixData,
  ChallengeRecord,
  SpecToPromptData,
  TokenGolfData,
  UIReproductionData,
} from "./types";

export const challengeIds = {
  "SP-E1": "00000000-0000-4000-8000-000000000001",
  "SP-E2": "00000000-0000-4000-8000-000000000002",
  "SP-M1": "00000000-0000-4000-8000-000000000003",
  "SP-M2": "00000000-0000-4000-8000-000000000004",
  "SP-H1": "00000000-0000-4000-8000-000000000005",
  "SP-H2": "00000000-0000-4000-8000-000000000006",
  "TG-E1": "00000000-0000-4000-8000-000000000007",
  "TG-E2": "00000000-0000-4000-8000-000000000008",
  "TG-M1": "00000000-0000-4000-8000-000000000009",
  "TG-M2": "00000000-0000-4000-8000-000000000010",
  "TG-H1": "00000000-0000-4000-8000-000000000011",
  "TG-H2": "00000000-0000-4000-8000-000000000012",
  "BF-E1": "00000000-0000-4000-8000-000000000013",
  "BF-E2": "00000000-0000-4000-8000-000000000014",
  "BF-M1": "00000000-0000-4000-8000-000000000015",
  "BF-M2": "00000000-0000-4000-8000-000000000016",
  "BF-H1": "00000000-0000-4000-8000-000000000017",
  "BF-H2": "00000000-0000-4000-8000-000000000018",
  "AP-E1": "00000000-0000-4000-8000-000000000019",
  "AP-E2": "00000000-0000-4000-8000-000000000020",
  "AP-M1": "00000000-0000-4000-8000-000000000021",
  "AP-M2": "00000000-0000-4000-8000-000000000022",
  "AP-H1": "00000000-0000-4000-8000-000000000023",
  "AP-H2": "00000000-0000-4000-8000-000000000024",
  "UR-E1": "00000000-0000-4000-8000-000000000025",
  "UR-E2": "00000000-0000-4000-8000-000000000026",
  "UR-M1": "00000000-0000-4000-8000-000000000027",
  "UR-M2": "00000000-0000-4000-8000-000000000028",
  "UR-H1": "00000000-0000-4000-8000-000000000029",
  "UR-H2": "00000000-0000-4000-8000-000000000030",
} as const;

const specChallenges: Array<ChallengeRecord<SpecToPromptData>> = [
  {
    id: challengeIds["SP-E1"],
    code: "SP-E1",
    category: "spec_to_prompt",
    difficulty: "easy",
    rating: 900,
    title: "FizzBuzz with a Twist",
    description: "Translate a one-shot voice note into a precise Python prompt.",
    challenge_data: {
      voice_note_url: "/voice-notes/sp-e1.mp3",
      voice_note_script:
        "Hey, I need you to write a program. It should print numbers from 1 to 100. But here's the twist — for multiples of 3, print 'Vibe' instead of the number. For multiples of 5, print 'Code' instead. And for multiples of both 3 and 5, print 'VibeCode'. Output it as a Python function that returns a list of strings.",
      supplementary_images: [],
      prompt_mode: "single",
      expected_behavior:
        'A Python function returning a list of 100 strings with correct substitutions for "Vibe", "Code", and "VibeCode".',
      rubric:
        "Check that the prompt clearly specifies the 1-100 range, all three substitution rules, and that the output is a Python function returning a list of strings. Deduct for ambiguity or missing constraints.",
    },
  },
  {
    id: challengeIds["SP-E2"],
    code: "SP-E2",
    category: "spec_to_prompt",
    difficulty: "easy",
    rating: 1000,
    title: "CSV Data Summarizer",
    description: "Capture a data-processing voice note without losing file or sort requirements.",
    challenge_data: {
      voice_note_url: "/voice-notes/sp-e2.mp3",
      voice_note_script:
        "I have a CSV file with three columns: name, department, and salary. I need a Python script that reads this CSV file, calculates the average salary per department, and prints the results sorted by average salary from highest to lowest. The file is called employees.csv.",
      supplementary_images: [],
      prompt_mode: "single",
      expected_behavior:
        "Python script that reads employees.csv, groups by department, calculates the average salary per department, sorts results descending, and prints the output cleanly.",
      rubric:
        "Check for correct filename, grouping by department, average salary calculation, descending sort, and an explicit print/output expectation.",
    },
  },
  {
    id: challengeIds["SP-M1"],
    code: "SP-M1",
    category: "spec_to_prompt",
    difficulty: "medium",
    rating: 1300,
    title: "REST API Endpoint Design",
    description: "Plan and act on a CRUD API spec with validation and filtering constraints.",
    challenge_data: {
      voice_note_url: "/voice-notes/sp-m1.mp3",
      voice_note_script:
        "Alright, so I need you to help me build a REST API endpoint using Express.js and Node. The endpoint should handle a todo list. I need CRUD operations — create, read, update, delete. Each todo has an id, a title, a description, a status which can be pending, in-progress, or done, and a created_at timestamp. Use an in-memory array for storage, no database needed. But here's the important part — I need input validation. Title is required and must be between 3 and 100 characters. Status must be one of the three valid values. Return proper HTTP status codes. And add a GET endpoint that supports filtering by status as a query parameter.",
      supplementary_images: ["/screenshots/spec-rest-api-table.svg"],
      prompt_mode: "plan_act",
      expected_behavior:
        "Working Express.js CRUD API with all five todo endpoints, in-memory storage, validation, proper HTTP status codes, and GET filtering by status.",
      rubric:
        "Plan should outline route structure, validation, and error handling. Judge whether all five endpoints exist, validation rules are enforced, status codes are correct, and filtering works.",
    },
  },
  {
    id: challengeIds["SP-M2"],
    code: "SP-M2",
    category: "spec_to_prompt",
    difficulty: "medium",
    rating: 1400,
    title: "Markdown to HTML Converter",
    description: "Use a plan-plus-act flow to encode parsing constraints exactly.",
    challenge_data: {
      voice_note_url: "/voice-notes/sp-m2.mp3",
      voice_note_script:
        "I need a JavaScript function that converts a subset of Markdown to HTML. It should handle these elements: headings — H1 through H3, so lines starting with one, two, or three hash symbols. Bold text wrapped in double asterisks. Italic text wrapped in single asterisks. Unordered lists where lines start with a dash. And code blocks wrapped in triple backticks. It should be a single function that takes a Markdown string and returns an HTML string. Don't use any external libraries.",
      supplementary_images: ["/screenshots/spec-markdown-example.svg"],
      prompt_mode: "plan_act",
      expected_behavior:
        "A pure JavaScript function that converts H1-H3 headings, bold, italic, unordered lists, and fenced code blocks from markdown into HTML.",
      rubric:
        "Plan should explain a parsing strategy. Act must cover all five markdown constructs without external libraries and avoid obvious edge-case failures.",
    },
  },
  {
    id: challengeIds["SP-H1"],
    code: "SP-H1",
    category: "spec_to_prompt",
    difficulty: "hard",
    rating: 1700,
    title: "Real-time Chat Server",
    description: "Prompt a multi-feature Socket.io room server from a dense spec and diagram.",
    challenge_data: {
      voice_note_url: "/voice-notes/sp-h1.mp3",
      voice_note_script:
        "I need a real-time chat application backend using Node.js and Socket.io. Requirements: Users can join named rooms. When a user joins, everyone in that room gets a notification saying who joined. Messages sent in a room are broadcast to all other users in that room, not to the sender. Each message should have a timestamp, the sender's username, and the message text. Users can be in only one room at a time — joining a new room should leave the old one. Add a slash-command: when a user types /users, they should see a list of all users currently in their room. The server should also maintain a history of the last 50 messages per room, and when a new user joins, they should receive this history. Oh and usernames must be unique across the server — reject duplicates.",
      supplementary_images: ["/screenshots/spec-chat-architecture.svg"],
      prompt_mode: "plan_act",
      expected_behavior:
        "A Socket.io server that supports unique usernames, room join/leave, room-scoped broadcasts, /users, 50-message history, and metadata on each message.",
      rubric:
        "Plan should cover room state, history storage, uniqueness, and slash commands. Score each major feature and deduct for missing room isolation or history replay.",
    },
  },
  {
    id: challengeIds["SP-H2"],
    code: "SP-H2",
    category: "spec_to_prompt",
    difficulty: "hard",
    rating: 1800,
    title: "Task Scheduler with Dependencies",
    description: "Turn a graph-and-timing voice note into a parallel Python scheduler.",
    challenge_data: {
      voice_note_url: "/voice-notes/sp-h2.mp3",
      voice_note_script:
        "Build me a task scheduling system in Python. Each task has an ID, a name, a duration in seconds, and a list of dependency task IDs — meaning those tasks must complete before this one can start. The scheduler should figure out the correct execution order using topological sorting. It should detect circular dependencies and throw an error if found. Then it should simulate execution: tasks that have no pending dependencies should run in parallel, simulated with asyncio. Print when each task starts and finishes, with timestamps. Finally, calculate and print the total time to complete all tasks and the critical path — that's the longest chain of dependent tasks.",
      supplementary_images: ["/screenshots/spec-task-graph.svg"],
      prompt_mode: "plan_act",
      expected_behavior:
        "Python asyncio scheduler with topological sorting, cycle detection, parallel task execution, timestamped logging, and critical-path calculation.",
      rubric:
        "Judge topo sort, cycle detection, asyncio-based parallel simulation, timing output, critical path calculation, and clean error handling.",
    },
  },
];

const tokenGolfChallenges: Array<ChallengeRecord<TokenGolfData>> = [
  {
    id: challengeIds["TG-E1"],
    code: "TG-E1",
    category: "token_golf",
    difficulty: "easy",
    rating: 850,
    title: "Reverse a String",
    description: "Produce an iterative Python reversal function with minimal tokens.",
    challenge_data: {
      target_description:
        "Write a Python function called `reverse_string` that takes a string and returns it reversed. Do not use slicing or the built-in `reversed()` function.",
      target_output: String.raw`def reverse_string(s):
    result = ""
    for char in s:
        result = char + result
    return result`,
      verification_prompt:
        "Check if the output is a Python function named reverse_string that reverses a string without using slicing or the reversed() built-in. Iterative solutions are acceptable.",
      max_tokens_allowed: 200,
    },
  },
  {
    id: challengeIds["TG-E2"],
    code: "TG-E2",
    category: "token_golf",
    difficulty: "easy",
    rating: 950,
    title: "Palindrome Checker",
    description: "Write a short JavaScript palindrome solution with cleanup rules intact.",
    challenge_data: {
      target_description:
        "Write a JavaScript function `isPalindrome` that checks if a given string is a palindrome, ignoring case and non-alphanumeric characters.",
      target_output: String.raw`function isPalindrome(str) {
  const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  return cleaned === cleaned.split('').reverse().join('');
}`,
      verification_prompt:
        "Verify that the output is a JavaScript function named isPalindrome that ignores case and non-alphanumeric characters. Functionally equivalent approaches are acceptable.",
      max_tokens_allowed: 250,
    },
  },
  {
    id: challengeIds["TG-M1"],
    code: "TG-M1",
    category: "token_golf",
    difficulty: "medium",
    rating: 1250,
    title: "Binary Search Tree Insert & Search",
    description: "Compress a class-based BST implementation without losing behavior.",
    challenge_data: {
      target_description:
        "Write a Python class `BST` with methods `insert(value)` and `search(value)` implementing a binary search tree. Include a `Node` class with `left`, `right`, and `value` attributes.",
      target_output: String.raw`class Node:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

class BST:
    def __init__(self):
        self.root = None

    def insert(self, value):
        if not self.root:
            self.root = Node(value)
        else:
            self._insert(self.root, value)

    def _insert(self, node, value):
        if value < node.value:
            if node.left is None:
                node.left = Node(value)
            else:
                self._insert(node.left, value)
        else:
            if node.right is None:
                node.right = Node(value)
            else:
                self._insert(node.right, value)

    def search(self, value):
        return self._search(self.root, value)

    def _search(self, node, value):
        if node is None:
            return False
        if value == node.value:
            return True
        elif value < node.value:
            return self._search(node.left, value)
        else:
            return self._search(node.right, value)`,
      verification_prompt:
        "Verify this is a BST implementation with a Node class, a BST class, insert(), and search(). Insert must maintain BST ordering and search must return a boolean.",
      max_tokens_allowed: 500,
    },
  },
  {
    id: challengeIds["TG-M2"],
    code: "TG-M2",
    category: "token_golf",
    difficulty: "medium",
    rating: 1350,
    title: "Debounce Function",
    description: "Keep a JavaScript debounce utility short while preserving cancel and context behavior.",
    challenge_data: {
      target_description:
        "Write a JavaScript `debounce` function that takes a function and a delay in ms, returns a debounced version. The debounced function should reset its timer on each call and only execute after the delay has passed since the last call. Include a `cancel()` method on the returned function.",
      target_output: String.raw`function debounce(fn, delay) {
  let timeoutId;
  
  function debounced(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  }
  
  debounced.cancel = function() {
    clearTimeout(timeoutId);
  };
  
  return debounced;
}`,
      verification_prompt:
        "Verify this debounce implementation takes a function and delay, resets the timer on each call, preserves this/args, and exposes cancel().",
      max_tokens_allowed: 400,
    },
  },
  {
    id: challengeIds["TG-H1"],
    code: "TG-H1",
    category: "token_golf",
    difficulty: "hard",
    rating: 1650,
    title: "LRU Cache",
    description: "Reach a fully working O(1) cache implementation with tight prompt discipline.",
    challenge_data: {
      target_description:
        "Implement an LRU Cache in Python with O(1) get and put operations. The class `LRUCache` takes a capacity in its constructor. `get(key)` returns the value or -1 if not found. `put(key, value)` inserts or updates. When capacity is exceeded, evict the least recently used item. Use a doubly linked list + hash map approach.",
      target_output: String.raw`class Node:
    def __init__(self, key=0, value=0):
        self.key = key
        self.value = value
        self.prev = None
        self.next = None

class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.cache = {}
        self.head = Node()
        self.tail = Node()
        self.head.next = self.tail
        self.tail.prev = self.head

    def _remove(self, node):
        node.prev.next = node.next
        node.next.prev = node.prev

    def _add_to_front(self, node):
        node.next = self.head.next
        node.prev = self.head
        self.head.next.prev = node
        self.head.next = node

    def get(self, key):
        if key in self.cache:
            node = self.cache[key]
            self._remove(node)
            self._add_to_front(node)
            return node.value
        return -1

    def put(self, key, value):
        if key in self.cache:
            self._remove(self.cache[key])
        node = Node(key, value)
        self.cache[key] = node
        self._add_to_front(node)
        if len(self.cache) > self.capacity:
            lru = self.tail.prev
            self._remove(lru)
            del self.cache[lru.key]`,
      verification_prompt:
        "Verify this is an LRU cache with O(1) get and put using a doubly linked list plus hash map, correct least-recently-used eviction, -1 misses, and update handling.",
      max_tokens_allowed: 700,
    },
  },
  {
    id: challengeIds["TG-H2"],
    code: "TG-H2",
    category: "token_golf",
    difficulty: "hard",
    rating: 1750,
    title: "Event Emitter",
    description: "Minimize prompt tokens without losing chainability or once-listener behavior.",
    challenge_data: {
      target_description:
        "Implement a JavaScript EventEmitter class with `on(event, callback)`, `off(event, callback)`, `emit(event, ...args)`, and `once(event, callback)`. All methods should return `this`.",
      target_output: String.raw`class EventEmitter {
  constructor() {
    this.listeners = {};
  }

  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
    return this;
  }

  off(event, callback) {
    if (!this.listeners[event]) return this;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    return this;
  }

  emit(event, ...args) {
    if (!this.listeners[event]) return this;
    this.listeners[event].forEach(cb => cb.apply(this, args));
    return this;
  }

  once(event, callback) {
    const wrapper = (...args) => {
      callback.apply(this, args);
      this.off(event, wrapper);
    };
    return this.on(event, wrapper);
  }
}`,
      verification_prompt:
        "Verify this is an EventEmitter with on, off, emit, and once. Listeners must receive args, once must self-remove, and every method must be chainable.",
      max_tokens_allowed: 600,
    },
  },
];

const bugFixChallenges: Array<ChallengeRecord<BugFixData>> = [
  {
    id: challengeIds["BF-E1"],
    code: "BF-E1",
    category: "bug_fix",
    difficulty: "easy",
    rating: 900,
    title: "Binary Search Debugging",
    description: "Inspect a short Python search function and write a precise repair prompt.",
    challenge_data: {
      code: String.raw`def binary_search(arr, target):
    left = 0
    right = len(arr)
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`,
      language: "python",
      task: "This binary search should find a target index in a sorted array.",
      bug_description:
        "right is initialized to len(arr) instead of len(arr) - 1, which can trigger an out-of-range access.",
      bug_location: "Line 3",
      expected_fix: "Change `right = len(arr)` to `right = len(arr) - 1`.",
      rubric:
        'Judge how precisely the learner identified the off-by-one boundary. Prompts like "fix this" should score near zero; prompts that point to the right bound and the exact corrected expression score highly.',
    },
  },
  {
    id: challengeIds["BF-E2"],
    code: "BF-E2",
    category: "bug_fix",
    difficulty: "easy",
    rating: 1000,
    title: "Sequence Function Debugging",
    description: "Inspect a short JavaScript numeric function and identify the logic error.",
    challenge_data: {
      code: String.raw`function fibonacci(n) {
  if (n <= 0) return 0;
  if (n === 1) return 1;
  
  let prev = 0, curr = 1;
  for (let i = 2; i < n; i++) {
    let temp = curr;
    curr = prev + curr;
    prev = temp;
  }
  return curr;
}`,
      language: "javascript",
      task: "This function should return the nth Fibonacci number.",
      bug_description:
        "The loop condition uses i < n instead of i <= n, so it stops one iteration too early.",
      bug_location: "Line 5 — the for-loop condition",
      expected_fix: "Change `i < n` to `i <= n`.",
      rubric:
        "High scores require identifying the loop condition as the root cause, not just saying the output is wrong.",
    },
  },
  {
    id: challengeIds["BF-M1"],
    code: "BF-M1",
    category: "bug_fix",
    difficulty: "medium",
    rating: 1300,
    title: "Async Helper Debugging",
    description: "Review an asynchronous helper and prompt the AI toward the correct repair.",
    challenge_data: {
      code: String.raw`class UserCache {
  constructor() {
    this.cache = {};
  }

  async getUser(id) {
    if (this.cache[id]) {
      return this.cache[id];
    }

    const response = await fetch('/api/users/' + id);
    const user = await response.json();
    this.cache[id] = user;
    return user;
  }

  async getUsers(ids) {
    const results = [];
    for (const id of ids) {
      results.push(this.getUser(id));
    }
    return results;
  }
}`,
      language: "javascript",
      task: "getUsers should return resolved user objects for all requested ids.",
      bug_description:
        "getUsers collects unresolved Promises and returns them directly instead of awaiting them or using Promise.all().",
      bug_location: "Lines 18-20 — the body of getUsers()",
      expected_fix: "Return `Promise.all(ids.map((id) => this.getUser(id)))` or await each fetch before pushing.",
      rubric:
        "Reward prompts that explicitly mention promises being returned instead of resolved values and suggest Promise.all or awaited collection.",
    },
  },
  {
    id: challengeIds["BF-M2"],
    code: "BF-M2",
    category: "bug_fix",
    difficulty: "medium",
    rating: 1400,
    title: "React Update Debugging",
    description: "Inspect a React component with incorrect update behavior and write a targeted fix prompt.",
    challenge_data: {
      code: String.raw`import { useState } from 'react';

function TodoList() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');

  const addTodo = () => {
    if (!input.trim()) return;
    todos.push({ id: Date.now(), text: input, done: false });
    setTodos(todos);
    setInput('');
  };

  const toggleTodo = (id) => {
    const todo = todos.find(t => t.id === id);
    todo.done = !todo.done;
    setTodos(todos);
  };

  return (
    <div>
      <input value={input} onChange={e => setInput(e.target.value)} />
      <button onClick={addTodo}>Add</button>
      <ul>
        {todos.map(todo => (
          <li key={todo.id} onClick={() => toggleTodo(todo.id)}
              style={{ textDecoration: todo.done ? 'line-through' : 'none' }}>
            {todo.text}
          </li>
        ))}
      </ul>
    </div>
  );
}`,
      language: "javascript",
      task: "The TodoList should rerender correctly when items are added or toggled.",
      bug_description:
        "The code mutates React state directly and then passes the same array reference back to setTodos, so React does not detect a change.",
      bug_location: "Lines 9-10 and 16-17",
      expected_fix:
        "Create new arrays and objects when updating state, for example with spreads and map().",
      rubric:
        "High scores require mentioning direct mutation and same-reference updates, not just saying React state is broken.",
    },
  },
  {
    id: challengeIds["BF-H1"],
    code: "BF-H1",
    category: "bug_fix",
    difficulty: "hard",
    rating: 1700,
    title: "Event Stream Debugging",
    description: "Analyze a reconnecting stream wrapper and identify the lifecycle bug precisely.",
    challenge_data: {
      code: String.raw`class DataStream {
  constructor(url) {
    this.url = url;
    this.listeners = new Set();
    this.buffer = [];
    this.maxBuffer = 1000;
    this.connection = null;
  }

  connect() {
    this.connection = new EventSource(this.url);
    
    this.connection.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.buffer.push(data);
      
      if (this.buffer.length > this.maxBuffer) {
        this.buffer = this.buffer.slice(-this.maxBuffer);
      }
      
      this.listeners.forEach(callback => {
        try {
          callback(data);
        } catch (err) {
          console.error('Listener error:', err);
        }
      });
    };

    this.connection.onerror = (err) => {
      console.error('Connection error, reconnecting...');
      this.connection.close();
      setTimeout(() => this.connect(), 5000);
    };
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  disconnect() {
    if (this.connection) {
      this.connection.close();
    }
  }
}`,
      language: "javascript",
      task: "disconnect() should fully tear down the stream and avoid reconnect leaks.",
      bug_description:
        "Reconnect timeouts are not tracked or cleared, connections can duplicate after errors, and disconnect() leaks listeners and buffered data.",
      bug_location: "Lines 29-31 and 42-46",
      expected_fix:
        "Track reconnect timer IDs, clear them on disconnect, close existing connections before reconnect, and clear listeners/buffer during teardown.",
      rubric:
        "Reward prompts that mention pending reconnect timers, duplicate EventSource connections, and memory retained in listeners/buffer.",
    },
  },
  {
    id: challengeIds["BF-H2"],
    code: "BF-H2",
    category: "bug_fix",
    difficulty: "hard",
    rating: 1800,
    title: "Concurrent Resource Debugging",
    description: "Review concurrent resource-handling code and prompt for the safest repair.",
    challenge_data: {
      code: String.raw`class ResourcePool {
  constructor(size) {
    this.available = Array.from({ length: size }, (_, i) => i);
    this.waiting = [];
  }

  async acquire() {
    if (this.available.length > 0) {
      return this.available.pop();
    }
    return new Promise(resolve => {
      this.waiting.push(resolve);
    });
  }

  release(resource) {
    if (this.waiting.length > 0) {
      const resolve = this.waiting.shift();
      resolve(resource);
    } else {
      this.available.push(resource);
    }
  }
}

async function processItems(pool, items) {
  const results = await Promise.all(
    items.map(async (item) => {
      const resource1 = await pool.acquire();
      const resource2 = await pool.acquire();
      
      try {
        const result = await doWork(resource1, resource2, item);
        return result;
      } finally {
        pool.release(resource1);
        pool.release(resource2);
      }
    })
  );
  return results;
}`,
      language: "javascript",
      task: "Items should process without deadlocking when multiple tasks need two pooled resources.",
      bug_description:
        "Concurrent tasks each acquire one resource and then block forever waiting for a second one, creating a classic deadlock.",
      bug_location: "Lines 26-37 in processItems()",
      expected_fix:
        "Acquire resources atomically, limit concurrency so only safe numbers of tasks run, or add a multi-resource acquire operation.",
      rubric:
        "Best prompts explicitly describe the deadlock pattern, not just that Promise.all causes issues.",
    },
  },
];

const architectureChallenges: Array<ChallengeRecord<ArchitecturePickData>> = [
  {
    id: challengeIds["AP-E1"],
    code: "AP-E1",
    category: "architecture_pick",
    difficulty: "easy",
    rating: 850,
    title: "Database for a Blog",
    description: "Rank practical database choices for a simple relational product.",
    challenge_data: {
      scenario:
        "You're building a personal blog with posts, categories, and comments. Expected traffic is around 100 daily visitors. You need to decide on a database.",
      options: [
        {
          id: "A",
          title: "PostgreSQL with a managed service",
          description:
            "Relational data model, strong query support, and good fit for posts, categories, and comments.",
        },
        {
          id: "B",
          title: "MongoDB Atlas",
          description:
            "Flexible schema, easy to start, but weaker relational guarantees for structured content.",
        },
        {
          id: "C",
          title: "Redis",
          description:
            "In-memory storage optimized for caching and sessions rather than primary relational data.",
        },
      ],
      correct_ranking: ["A", "B", "C"],
      explanations: {
        A: "Blog data is naturally relational. PostgreSQL handles posts, categories, and comments cleanly with strong integrity and simple operational overhead.",
        B: "MongoDB can work, but the schema flexibility is not especially valuable for a structured blog.",
        C: "Redis is not a sensible primary database here. It is best used as a cache, not the source of truth.",
      },
    },
  },
  {
    id: challengeIds["AP-E2"],
    code: "AP-E2",
    category: "architecture_pick",
    difficulty: "easy",
    rating: 1000,
    title: "Frontend Framework for a Landing Page",
    description: "Choose the right level of frontend tooling for a small marketing site.",
    challenge_data: {
      scenario:
        "A startup needs a marketing landing page with animations, a contact form, and SEO optimization. It should be fast to build and fast to load.",
      options: [
        {
          id: "A",
          title: "Next.js with static export",
          description: "React-based, SEO-friendly, and backed by a strong ecosystem.",
        },
        {
          id: "B",
          title: "Plain HTML/CSS/JS with a form service",
          description: "Minimal dependencies, fastest load time, and enough for a simple marketing page.",
        },
        {
          id: "C",
          title: "Angular with SSR",
          description: "Full framework with enterprise ergonomics, but heavy for a small landing page.",
        },
      ],
      correct_ranking: ["B", "A", "C"],
      explanations: {
        A: "Next.js works well and is a good second choice, but it is more framework than this page strictly needs.",
        B: "This is the most pragmatic answer for a simple landing page with only light interactivity and SEO needs.",
        C: "Angular is significant overkill for this scope and slows both setup and delivery.",
      },
    },
  },
  {
    id: challengeIds["AP-M1"],
    code: "AP-M1",
    category: "architecture_pick",
    difficulty: "medium",
    rating: 1250,
    title: "Real-time Feature Architecture",
    description: "Rank options for adding notifications to an existing Express stack under a short deadline.",
    challenge_data: {
      scenario:
        "Your team is adding real-time notifications to an existing Express.js REST API. Users should see notifications instantly without refreshing. The backend already uses PostgreSQL. You have 2 weeks.",
      options: [
        {
          id: "A",
          title: "Add Socket.io to the existing Express server",
          description:
            "Reuse the same process and auth model with minimal new infrastructure.",
        },
        {
          id: "B",
          title: "Build a separate Go microservice with Redis pub/sub",
          description:
            "A dedicated real-time stack with more operational overhead and coordination cost.",
        },
        {
          id: "C",
          title: "Use Supabase Realtime over PostgreSQL",
          description:
            "Leverage built-in realtime over database changes if it fits the current stack.",
        },
      ],
      correct_ranking: ["A", "C", "B"],
      explanations: {
        A: "Socket.io alongside the existing Express app is the most pragmatic path inside a two-week delivery window.",
        B: "A Go microservice plus Redis is far too much infrastructure and complexity for the stated scope and timeline.",
        C: "Supabase Realtime is a reasonable second option if the team already operates comfortably in that ecosystem.",
      },
    },
  },
  {
    id: challengeIds["AP-M2"],
    code: "AP-M2",
    category: "architecture_pick",
    difficulty: "medium",
    rating: 1400,
    title: "Auth Strategy for a Multi-Tenant SaaS",
    description: "Decide how much authentication complexity to buy versus build.",
    challenge_data: {
      scenario:
        "You're building a B2B SaaS where each company has its own users, data, and billing. Some tenants will require SSO through their corporate identity provider.",
      options: [
        {
          id: "A",
          title: "Auth0 or Clerk",
          description:
            "Managed auth with SSO, RBAC, and multi-tenant support out of the box.",
        },
        {
          id: "B",
          title: "Roll your own with JWT + bcrypt",
          description:
            "Maximum control, but you own security, SSO complexity, and operational burden.",
        },
        {
          id: "C",
          title: "Firebase Auth with custom tenant claims",
          description:
            "Solid managed auth baseline, though enterprise SSO is less turnkey than dedicated B2B auth vendors.",
        },
      ],
      correct_ranking: ["A", "C", "B"],
      explanations: {
        A: "Managed auth is the safest and most time-effective answer for real multi-tenant SaaS with SSO requirements.",
        B: "Rolling your own multi-tenant auth and SSO is a high-risk distraction with a large security surface area.",
        C: "Firebase Auth can work as a starting point, but B2B SSO capability is less complete than the dedicated managed providers.",
      },
    },
  },
  {
    id: challengeIds["AP-H1"],
    code: "AP-H1",
    category: "architecture_pick",
    difficulty: "hard",
    rating: 1650,
    title: "Scaling a File Processing Pipeline",
    description: "Evaluate async job-processing options for an overloaded upload flow.",
    challenge_data: {
      scenario:
        "Your app lets users upload PDFs up to 50MB which are OCR'd, parsed, and indexed for search. Traffic is growing from 100 files/day to 10,000 files/day and synchronous API processing is timing out.",
      options: [
        {
          id: "A",
          title: "Queue-based async pipeline",
          description:
            "Store uploads, enqueue jobs, process with workers, update status in the database, and notify users asynchronously.",
        },
        {
          id: "B",
          title: "Scale the API horizontally and increase timeout",
          description:
            "Add more API instances and more RAM but keep processing inside the request-response cycle.",
        },
        {
          id: "C",
          title: "S3-triggered AWS Lambda",
          description:
            "Serverless auto-scaling with less server management, but tighter runtime and memory constraints.",
        },
      ],
      correct_ranking: ["A", "C", "B"],
      explanations: {
        A: "A job queue is the clearest fit for heavy, retryable background work and decouples uploads from processing cleanly.",
        B: "More API instances and longer timeouts do not solve the architectural problem of heavy synchronous work in request handlers.",
        C: "Lambda can work for some file pipelines, but OCR-heavy 50MB workloads can run into execution and debugging constraints.",
      },
    },
  },
  {
    id: challengeIds["AP-H2"],
    code: "AP-H2",
    category: "architecture_pick",
    difficulty: "hard",
    rating: 1800,
    title: "State Management for a Collaborative Editor",
    description: "Rank real-time collaboration strategies for rich-text co-editing.",
    challenge_data: {
      scenario:
        "You're building a collaborative document editor. Multiple users edit simultaneously, see each other's cursors, and changes must merge without destructive conflicts.",
      options: [
        {
          id: "A",
          title: "CRDTs with Yjs",
          description:
            "Modern conflict-free replicated data types with strong editor ecosystem support.",
        },
        {
          id: "B",
          title: "Operational Transformation with ShareDB",
          description:
            "The classic collaborative-editing model with strong precedent but more implementation complexity.",
        },
        {
          id: "C",
          title: "Last-write-wins with polling",
          description:
            "Store the latest document in the database and overwrite changes every few seconds.",
        },
      ],
      correct_ranking: ["A", "B", "C"],
      explanations: {
        A: "Yjs is the most modern and ergonomic answer for rich collaborative editing, especially for a team that wants strong library support.",
        B: "OT works but is more complex and less attractive than CRDT-based tooling for a modern build.",
        C: "Last-write-wins with polling simply cannot preserve collaborative edits safely and destroys the user experience.",
      },
    },
  },
];

const uiChallenges: Array<ChallengeRecord<UIReproductionData>> = [
  {
    id: challengeIds["UR-E1"],
    code: "UR-E1",
    category: "ui_reproduction",
    difficulty: "easy",
    rating: 900,
    title: "Pricing Card",
    description: "Recreate a clean pricing card in one prompt.",
    challenge_data: {
      target_screenshot_url: "/screenshots/ur-e1.png",
      target_html_css: String.raw`<!DOCTYPE html>
<html>
<head>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f0f0f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
  .card { background: white; border-radius: 16px; padding: 40px; width: 320px; text-align: center; box-shadow: 0 4px 24px rgba(0,0,0,0.1); }
  .card .plan { font-size: 14px; text-transform: uppercase; letter-spacing: 2px; color: #888; margin-bottom: 8px; }
  .card .price { font-size: 48px; font-weight: 700; color: #111; margin-bottom: 4px; }
  .card .price span { font-size: 18px; color: #888; font-weight: 400; }
  .card .period { font-size: 14px; color: #888; margin-bottom: 24px; }
  .card ul { list-style: none; text-align: left; margin-bottom: 32px; }
  .card ul li { padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #444; }
  .card ul li::before { content: "✓"; color: #22c55e; margin-right: 8px; font-weight: bold; }
  .card button { width: 100%; padding: 14px; background: #111; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; font-weight: 600; }
  .card button:hover { background: #333; }
</style>
</head>
<body>
  <div class="card">
    <div class="plan">Pro Plan</div>
    <div class="price">$29<span>/mo</span></div>
    <div class="period">Billed monthly</div>
    <ul>
      <li>Unlimited projects</li>
      <li>Priority support</li>
      <li>Custom domain</li>
      <li>Analytics dashboard</li>
    </ul>
    <button>Get Started</button>
  </div>
</body>
</html>`,
      description:
        "A centered white pricing card on a light gray background with a plan label, bold price, features, and a CTA button.",
      rubric:
        "Compare layout, card shape, typography hierarchy, check-mark list styling, button treatment, and spacing proportions.",
    },
  },
  {
    id: challengeIds["UR-E2"],
    code: "UR-E2",
    category: "ui_reproduction",
    difficulty: "easy",
    rating: 1000,
    title: "Login Form",
    description: "Match a dark auth card with spacing and accent accuracy.",
    challenge_data: {
      target_screenshot_url: "/screenshots/ur-e2.png",
      target_html_css: String.raw`<!DOCTYPE html>
<html>
<head>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #18181b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
  .form-container { background: #27272a; border-radius: 12px; padding: 40px; width: 380px; }
  h2 { color: white; font-size: 24px; margin-bottom: 8px; }
  .subtitle { color: #a1a1aa; font-size: 14px; margin-bottom: 32px; }
  label { display: block; color: #d4d4d8; font-size: 13px; margin-bottom: 6px; font-weight: 500; }
  input { width: 100%; padding: 12px; background: #3f3f46; border: 1px solid #52525b; border-radius: 8px; color: white; font-size: 14px; margin-bottom: 20px; outline: none; }
  input:focus { border-color: #a78bfa; }
  .forgot { text-align: right; margin-top: -14px; margin-bottom: 24px; }
  .forgot a { color: #a78bfa; font-size: 13px; text-decoration: none; }
  button { width: 100%; padding: 12px; background: #7c3aed; color: white; border: none; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; }
  .signup-link { text-align: center; margin-top: 20px; color: #a1a1aa; font-size: 13px; }
  .signup-link a { color: #a78bfa; text-decoration: none; }
</style>
</head>
<body>
  <div class="form-container">
    <h2>Welcome back</h2>
    <p class="subtitle">Sign in to your account</p>
    <label>Email</label>
    <input type="email" placeholder="you@example.com">
    <label>Password</label>
    <input type="password" placeholder="••••••••">
    <div class="forgot"><a href="#">Forgot password?</a></div>
    <button>Sign In</button>
    <p class="signup-link">Don't have an account? <a href="#">Sign up</a></p>
  </div>
</body>
</html>`,
      description:
        "A rounded dark login card with two fields, a purple primary button, and helper links on a charcoal background.",
      rubric:
        "Compare dark theme consistency, input styling, purple accent treatment, typography, spacing, and overall proportions.",
    },
  },
  {
    id: challengeIds["UR-M1"],
    code: "UR-M1",
    category: "ui_reproduction",
    difficulty: "medium",
    rating: 1300,
    title: "Dashboard Stats Bar",
    description: "Reproduce a four-card stats strip with icon accents and performance text.",
    challenge_data: {
      target_screenshot_url: "/screenshots/ur-m1.png",
      target_html_css: String.raw`<!DOCTYPE html>
<html>
<head>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 40px; }
  .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; max-width: 1000px; margin: 0 auto; }
  .stat-card { background: #1e293b; border-radius: 12px; padding: 24px; }
  .stat-label { font-size: 13px; color: #94a3b8; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
  .stat-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px; }
  .stat-card:nth-child(1) .stat-icon { background: #1e3a5f; color: #60a5fa; }
  .stat-card:nth-child(2) .stat-icon { background: #1a3a2a; color: #4ade80; }
  .stat-card:nth-child(3) .stat-icon { background: #3b1f4a; color: #c084fc; }
  .stat-card:nth-child(4) .stat-icon { background: #3b2f1a; color: #fbbf24; }
  .stat-value { font-size: 32px; font-weight: 700; color: white; margin-bottom: 4px; }
  .stat-change { font-size: 13px; }
  .stat-change.positive { color: #4ade80; }
  .stat-change.negative { color: #f87171; }
</style>
</head>
<body>
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-label"><div class="stat-icon">👥</div> Total Users</div>
      <div class="stat-value">12,847</div>
      <div class="stat-change positive">↑ 12.5% from last month</div>
    </div>
    <div class="stat-card">
      <div class="stat-label"><div class="stat-icon">💰</div> Revenue</div>
      <div class="stat-value">$48,295</div>
      <div class="stat-change positive">↑ 8.2% from last month</div>
    </div>
    <div class="stat-card">
      <div class="stat-label"><div class="stat-icon">📦</div> Orders</div>
      <div class="stat-value">1,429</div>
      <div class="stat-change negative">↓ 3.1% from last month</div>
    </div>
    <div class="stat-card">
      <div class="stat-label"><div class="stat-icon">⭐</div> Rating</div>
      <div class="stat-value">4.8</div>
      <div class="stat-change positive">↑ 0.3 from last month</div>
    </div>
  </div>
</body>
</html>`,
      description:
        "A dark dashboard strip with four stat cards, accent-colored icons, large values, and positive or negative change labels.",
      rubric:
        "Compare the four-column layout, icon accent colors, dark card styling, typography hierarchy, change colors, and spacing.",
    },
  },
  {
    id: challengeIds["UR-M2"],
    code: "UR-M2",
    category: "ui_reproduction",
    difficulty: "medium",
    rating: 1400,
    title: "Navigation Sidebar",
    description: "Match a product sidebar with sections, active state, badge, and profile footer.",
    challenge_data: {
      target_screenshot_url: "/screenshots/ur-m2.png",
      target_html_css: String.raw`<!DOCTYPE html>
<html>
<head>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; display: flex; }
  .sidebar { width: 260px; height: 100vh; background: white; border-right: 1px solid #e2e8f0; padding: 24px 16px; display: flex; flex-direction: column; }
  .logo { font-size: 20px; font-weight: 700; color: #0f172a; padding: 0 12px; margin-bottom: 32px; display: flex; align-items: center; gap: 10px; }
  .logo-icon { width: 32px; height: 32px; background: #7c3aed; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: 16px; font-weight: bold; }
  .nav-section { margin-bottom: 24px; }
  .nav-section-title { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #94a3b8; padding: 0 12px; margin-bottom: 8px; }
  .nav-item { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 8px; color: #64748b; font-size: 14px; cursor: pointer; text-decoration: none; transition: all 0.15s; }
  .nav-item:hover { background: #f1f5f9; color: #0f172a; }
  .nav-item.active { background: #7c3aed10; color: #7c3aed; font-weight: 600; }
  .nav-item .icon { font-size: 18px; width: 20px; text-align: center; }
  .nav-item .badge { margin-left: auto; background: #7c3aed; color: white; font-size: 11px; padding: 2px 8px; border-radius: 10px; font-weight: 600; }
  .spacer { flex: 1; }
  .user-section { border-top: 1px solid #e2e8f0; padding-top: 16px; display: flex; align-items: center; gap: 12px; padding-left: 12px; }
  .avatar { width: 36px; height: 36px; border-radius: 50%; background: #e2e8f0; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 600; color: #64748b; }
  .user-info { font-size: 13px; }
  .user-name { color: #0f172a; font-weight: 600; }
  .user-email { color: #94a3b8; font-size: 12px; }
</style>
</head>
<body>
  <div class="sidebar">
    <div class="logo"><div class="logo-icon">V</div> VibeForces</div>
    <div class="nav-section">
      <div class="nav-section-title">Main</div>
      <a class="nav-item active"><span class="icon">📊</span> Dashboard</a>
      <a class="nav-item"><span class="icon">📝</span> Challenges <span class="badge">30</span></a>
      <a class="nav-item"><span class="icon">🏆</span> Leaderboard</a>
      <a class="nav-item"><span class="icon">⚡</span> Contests</a>
    </div>
    <div class="nav-section">
      <div class="nav-section-title">Account</div>
      <a class="nav-item"><span class="icon">👤</span> Profile</a>
      <a class="nav-item"><span class="icon">⚙️</span> Settings</a>
    </div>
    <div class="spacer"></div>
    <div class="user-section">
      <div class="avatar">JD</div>
      <div class="user-info">
        <div class="user-name">Jane Doe</div>
        <div class="user-email">jane@example.com</div>
      </div>
    </div>
  </div>
</body>
</html>`,
      description:
        "A clean sidebar with a logo block, grouped nav items, one purple active state, a badge, and a profile section at the bottom.",
      rubric:
        "Compare sidebar structure, active-state styling, badge placement, spacing, typography, and footer profile treatment.",
    },
  },
  {
    id: challengeIds["UR-H1"],
    code: "UR-H1",
    category: "ui_reproduction",
    difficulty: "hard",
    rating: 1700,
    title: "Hero Section with Feature Grid",
    description: "One-shot a full hero plus six-card feature grid.",
    challenge_data: {
      target_screenshot_url: "/screenshots/ur-h1.png",
      target_html_css: String.raw`<!DOCTYPE html>
<html>
<head>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #030712; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: white; }
  .hero { text-align: center; padding: 80px 20px 60px; max-width: 800px; margin: 0 auto; }
  .badge { display: inline-block; padding: 6px 16px; border-radius: 20px; border: 1px solid #374151; font-size: 13px; color: #9ca3af; margin-bottom: 24px; }
  .badge span { color: #a78bfa; }
  h1 { font-size: 56px; font-weight: 800; line-height: 1.1; margin-bottom: 20px; background: linear-gradient(to bottom, #ffffff, #6b7280); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .subtitle { font-size: 18px; color: #9ca3af; max-width: 600px; margin: 0 auto 40px; line-height: 1.6; }
  .buttons { display: flex; gap: 16px; justify-content: center; margin-bottom: 80px; }
  .btn-primary { padding: 14px 32px; background: #7c3aed; color: white; border: none; border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer; }
  .btn-secondary { padding: 14px 32px; background: transparent; color: white; border: 1px solid #374151; border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer; }
  .features { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; max-width: 1000px; margin: 0 auto; padding: 0 20px; }
  .feature-card { background: #111827; border: 1px solid #1f2937; border-radius: 16px; padding: 32px; text-align: left; }
  .feature-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; margin-bottom: 16px; }
  .feature-card:nth-child(1) .feature-icon { background: #1e1b4b; }
  .feature-card:nth-child(2) .feature-icon { background: #1a2e05; }
  .feature-card:nth-child(3) .feature-icon { background: #2a1a05; }
  .feature-card:nth-child(4) .feature-icon { background: #1b1b3a; }
  .feature-card:nth-child(5) .feature-icon { background: #051d20; }
  .feature-card:nth-child(6) .feature-icon { background: #200515; }
  .feature-title { font-size: 18px; font-weight: 600; margin-bottom: 8px; }
  .feature-desc { font-size: 14px; color: #9ca3af; line-height: 1.5; }
</style>
</head>
<body>
  <div class="hero">
    <div class="badge"><span>New</span> — AI workflow benchmark live</div>
    <h1>Train Your AI Instincts</h1>
    <p class="subtitle">The competitive platform for vibe coders. Master prompt engineering, debug AI output, and prove your skills on the leaderboard.</p>
    <div class="buttons">
      <button class="btn-primary">Start Practicing</button>
      <button class="btn-secondary">View Challenges</button>
    </div>
  </div>
  <div class="features">
    <div class="feature-card">
      <div class="feature-icon">🎯</div>
      <div class="feature-title">Spec-to-Prompt</div>
      <div class="feature-desc">Listen to a spec, craft the perfect prompt. Scored on clarity and output quality.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">⚡</div>
      <div class="feature-title">Token Golf</div>
      <div class="feature-desc">Achieve the target output in the fewest tokens. Efficiency is everything.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">🔧</div>
      <div class="feature-title">Bug Fix</div>
      <div class="feature-desc">Spot the bug, describe it precisely. Generic prompts score zero.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">🏗️</div>
      <div class="feature-title">Architecture Pick</div>
      <div class="feature-desc">Choose the right tool for the job. Rank options by engineering judgment.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">🎨</div>
      <div class="feature-title">UI Reproduction</div>
      <div class="feature-desc">See a screenshot, write one prompt. Get as close as possible in one shot.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">🏆</div>
      <div class="feature-title">Contests</div>
      <div class="feature-desc">Compete live against other vibe coders. Climb the leaderboard.</div>
    </div>
  </div>
</body>
</html>`,
      description:
        "A dark landing-page hero with gradient heading text, two CTA buttons, and a three-column feature grid.",
      rubric:
        "Compare gradient heading, badge styling, button pair, feature-grid spacing, card backgrounds, and overall page proportions.",
    },
  },
  {
    id: challengeIds["UR-H2"],
    code: "UR-H2",
    category: "ui_reproduction",
    difficulty: "hard",
    rating: 1800,
    title: "Leaderboard Table",
    description: "Match a leaderboard table with podium styling and filter tabs.",
    challenge_data: {
      target_screenshot_url: "/screenshots/ur-h2.png",
      target_html_css: String.raw`<!DOCTYPE html>
<html>
<head>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 40px; }
  .container { max-width: 900px; margin: 0 auto; }
  .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
  h2 { color: white; font-size: 24px; }
  .filter-tabs { display: flex; gap: 4px; background: #1e293b; border-radius: 8px; padding: 4px; }
  .filter-tab { padding: 8px 16px; border-radius: 6px; font-size: 13px; color: #94a3b8; border: none; background: transparent; cursor: pointer; }
  .filter-tab.active { background: #334155; color: white; font-weight: 600; }
  .table-container { background: #1e293b; border-radius: 12px; overflow: hidden; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; padding: 14px 20px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; border-bottom: 1px solid #334155; background: #1e293b; }
  td { padding: 16px 20px; font-size: 14px; color: #e2e8f0; border-bottom: 1px solid #334155; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: #334155; }
  .rank { font-weight: 700; width: 60px; }
  .rank-1 { color: #fbbf24; }
  .rank-2 { color: #d1d5db; }
  .rank-3 { color: #b45309; }
  .user-cell { display: flex; align-items: center; gap: 12px; }
  .user-avatar { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; color: white; }
  .score { font-weight: 700; color: #a78bfa; }
  .stat { color: #94a3b8; font-size: 13px; }
  .badge-gold { background: linear-gradient(135deg, #fbbf24, #d97706); }
  .badge-silver { background: linear-gradient(135deg, #d1d5db, #9ca3af); }
  .badge-bronze { background: linear-gradient(135deg, #d97706, #92400e); }
  .badge-default { background: #475569; }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>🏆 Leaderboard</h2>
      <div class="filter-tabs">
        <button class="filter-tab active">All Time</button>
        <button class="filter-tab">This Week</button>
        <button class="filter-tab">Today</button>
      </div>
    </div>
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>User</th>
            <th>Score</th>
            <th>Accuracy</th>
            <th>Tokens</th>
            <th>Solved</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="rank rank-1">#1</td>
            <td><div class="user-cell"><div class="user-avatar badge-gold">AK</div> Alex Kim</div></td>
            <td class="score">9,847</td>
            <td class="stat">94.2%</td>
            <td class="stat">12,450</td>
            <td class="stat">28/30</td>
          </tr>
          <tr>
            <td class="rank rank-2">#2</td>
            <td><div class="user-cell"><div class="user-avatar badge-silver">SP</div> Sarah Patel</div></td>
            <td class="score">9,231</td>
            <td class="stat">91.8%</td>
            <td class="stat">14,200</td>
            <td class="stat">27/30</td>
          </tr>
          <tr>
            <td class="rank rank-3">#3</td>
            <td><div class="user-cell"><div class="user-avatar badge-bronze">MJ</div> Marcus Johnson</div></td>
            <td class="score">8,654</td>
            <td class="stat">89.5%</td>
            <td class="stat">15,800</td>
            <td class="stat">26/30</td>
          </tr>
          <tr>
            <td class="rank">#4</td>
            <td><div class="user-cell"><div class="user-avatar badge-default">LC</div> Luna Chen</div></td>
            <td class="score">7,982</td>
            <td class="stat">87.1%</td>
            <td class="stat">16,300</td>
            <td class="stat">25/30</td>
          </tr>
          <tr>
            <td class="rank">#5</td>
            <td><div class="user-cell"><div class="user-avatar badge-default">RD</div> Raj Deshmukh</div></td>
            <td class="score">7,445</td>
            <td class="stat">85.3%</td>
            <td class="stat">17,100</td>
            <td class="stat">24/30</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</body>
</html>`,
      description:
        "A dark leaderboard table with filter tabs, podium colors for the top three ranks, avatars, and six data columns.",
      rubric:
        "Compare the full table structure, header tabs, top-three rank styling, avatar treatments, hover effects, and spacing.",
    },
  },
];

import { sde2Challenges } from "./challenge-library-sde2";

export const challengeLibrary: ChallengeRecord[] = [
  ...specChallenges,
  ...tokenGolfChallenges,
  ...bugFixChallenges,
  ...architectureChallenges,
  ...uiChallenges,
  ...sde2Challenges,
];

export const challengeSummaryCards = challengeLibrary.map((challenge) => ({
  id: challenge.id,
  code: challenge.code,
  category: challenge.category,
  difficulty: challenge.difficulty,
  rating: challenge.rating,
  title: challenge.title,
  description: challenge.description,
}));
