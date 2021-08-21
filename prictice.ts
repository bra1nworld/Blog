function finallys(callback) {
  return this.then(
    (value) => {
      return Promise.resolve(callback()).then((value) => value);
    },
    (error) => {
      return Promise.resolve(callback()).then((error) => {
        throw error;
      });
    },
  );
}

Promise.race = function (values) {
  return new Promise((resolve, reject) => {
    values.forEach((val) => {
      Promise.resolve(val).then(resolve, reject);
    });
  });
};

function hotPotato(nameList, num) {
  let queue;
  for (const name of nameList) {
    queue.enqueue(name);
  }

  let eliminated = "";
  while (queue.size() > 1) {
    for (let i = 0; i < num; i++) {
      queue.enqueue(queue.dequeue());
    }
    eliminated = queue.dequeue();
  }
  return queue.dequeue();
}

function LinkedList() {
  let Node = function (element) {
    this.element = element;
    this.next = null;
  };

  let length = 0;
  let head = null;

  this.append = function (element) {
    let node = new Node(element);
    let current;
    if (head === null) {
      head = node;
    } else {
      current = head;
    }
  };
}

function LdinkedList() {
  let Node = function (element) {
    this.element = element;
    this.next = null;
  };

  let length = 0;
  let head = null;

  this.append = function (element) {
    let node = new Node(element);
    let current;
    if (head == null) {
      head = node;
    } else {
      current = head;
      while (current.next) {
        current = current.next;
      }
      current.next = node;
    }
    length++;
  };

  this.insert = function (position, element) {
    if (position < 0 || position > length) return false;

    let current = head,
      node = new Node(element),
      previous,
      index = 0;

    if (position == 0) {
      node.next = current;
      head = node;
    } else {
      while (index++ < position) {
        previous = current;
        current = current.next;
      }
      node.next = current;
      previous.next = node;
    }
    length++;
    return true;
  };

  this.removeAt = function (position) {
    if (position < 0 || position >= length) return null;

    let current = head,
      previous,
      index = 0;

    if (position === 0) {
      head = current.next;
    } else {
      while (index++ < position) {
        previous = current;
        current = current.next;
      }
      previous.next = current.next;
    }

    length--;
    return current.element;
  };

  this.indexOf = function (element) {
    let current = head,
      index = -1;
    while (current) {
      if (element === current.element) {
        return index;
      }
      index++;
      current = current.next;
    }
    return -1;
  };

  this.remove = function (element) {
    let index = this.indexOf(element);
    return this.removeAt(index);
  };

  this.isEmpty = function () {
    return length == 0;
  };

  this.size = function () {
    return length;
  };

  this.getHead = function () {
    return head;
  };

  this.toString = function () {
    let current = head,
      string = "";
    while (current) {
      string += current + (current.next ? "," : "");
      current = current.next;
    }
    return string;
  };
}

function DoublyLinkedList() {
  let Node = function (element) {
    this.element = element;
    this.prev = null;
    this.next = null;
  };

  let length = 0;
  let head = null;
  let tail = null;

  this.insert = function (position, element) {
    if (position < 0 || position > length) return false;

    let node = new Node(element),
      current = head,
      previous,
      index = 0;

    if (position === 0) {
      if (!head) {
        head = node;
        tail = node;
      } else {
        node.next = current;
        current.prev = node;
        head = node;
      }
    } else if (position == length) {
      current = tail;
      current.next = node;
      node.prev = current;
      tail = node;
    } else {
      while (index++ < position) {
        previous = current;
        current = current.next;
      }

      node.next = current;
      current.prev = node;

      node.prev = previous;
      previous.next = node;
    }
    length++;
    return true;
  };

  this.removeAt = function (position) {
    if (position < 0 || position >= length) return null;

    let current = head,
      previous,
      index = 0;

    if (position === 0) {
      head = current.next;
      if (length === 1) {
        tail = null;
      } else {
        head.prev = null;
      }
    } else if (position == length - 1) {
      current = tail;
      tail = current.prev;
      tail.next = null;
    } else {
      while (index++ < position) {
        previous = current;
        current = current.next;
      }
      previous.next = current.next;
      current.next.prev = previous;
    }
    length--;
    return current.element;
  };
}

var reverseList = function (head) {
  if (head === undefined || head === null) return null;

  var originalHead = head;
  var reverseHead;

  var reverse = function (head) {
    if (head.next === null) {
      reverseHead = head;
      return head;
    }
    var node = reverse(head.next);
    node.next = head;

    if (originalHead === head) {
      head.next == null;
      return reverseHead;
    } else {
      return head;
    }
  };

  return reverse(head);
};

function BinarySearchTree() {
  var Node = function (key) {
    this.key = key;
    this.left = null;
    this.right = null;
  };

  var root = null;

  var insertNode = function (node, newNode) {
    if (newNode.key < node.key) {
      if (node.left == null) {
        node.left = newNode;
      } else {
        insertNode(node.left, newNode);
      }
    } else {
      if (node.right == null) {
        node.right = newNode;
      } else {
        insertNode(node.right, newNode);
      }
    }
  };

  this.insert = function (key) {
    var newNode = new Node(key);

    if (root === null) {
      root = newNode;
    } else {
      insertNode(root, newNode);
    }
  };
}

function bubblesort(arr) {
  let i,
    j,
    len = arr.length;
  for (let i = 0; i < len; i++) {
    let changed = false;
    for (j = 0; j < len - 1 - i; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        changed = true;
      }
    }
    if (!changed) break;
  }
}

function selectSort(arr) {
  let i,
    j,
    len = arr.lenght;
  for (i = 0; i < len - 1; i++) {
    let minIndex = i;
    for (j = i + 1; j < len; j++) {
      if (arr[j] < arr[minIndex]) {
        minIndex = j;
      }
    }
    if (i != minIndex) {
      [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
    }
  }
}

function insertSort(arr) {
  let i,
    j,
    len = arr.length;
  for (i = 1; i < len; i++) {
    let val = arr[i];
    for (j = i - 1; j >= 0 && arr[j] > val; j--) {
      arr[j + 1] = arr[j];
    }
    arr[j + 1] = val;
  }
}

function quickSort(arr) {
  quickSort(arr, 0, arr.length - 1);

  function quickSort(arr, left, right) {
    if (left < right) {
      let pivot = partition(arr, left, right);
      quickSort(arr, left, pivot - 1);
      quickSort(arr, pivot, right);
    }
  }

  function partition(arr, left, right) {
    let mid = arr[Math.floor(left + right) / 2];
    let i = left,
      j = right;

    while (i <= j) {
      while (arr[i] < mid) i++;
      while (arr[j] > mid) j--;

      if (i <= j) {
        [arr[i], arr[j]] = [arr[j], arr[i]];
        i++;
        j--;
      }
    }
    return i;
  }
}

function mergeSort(arr) {
  let gourpSize,
    i,
    firstPart,
    secondPart,
    secondPartSize,
    totalSize,
    len = arr.length;
  for (gourpSize = 1; gourpSize < len; gourpSize *= 2) {
    for (i = 0; i < len; i += 2 * gourpSize) {
      secondPartSize = Math.min(gourpSize, len - 1 - gourpSize);
      totalSize = secondPartSize + gourpSize;
      firstPart = arr.slice(i, i + gourpSize);
      secondPart = arr.slice(i + gourpSize, i + gourpSize + secondPartSize);
      arr.splice(i, totalSize, ...merge(firstPart, secondPart));
    }
  }

  function merge(arr1, arr2) {
    let arr = [],
      i = 0,
      j = 0;

    while (i < arr1.length && j < arr2.length) {
      arr1[i] < arr2[j] ? arr.push(arr1[i++]) : arr.push(arr2[j++]);
    }
    return i < arr1.length
      ? arr.concat(arr1.slice(i))
      : arr.concat(arr2.slice(j));
  }
}

function heepSortArr(arr) {
  let heapSize = arr.length;
  buildHeap(arr);

  while (heapSize > 1) {
    heapSize--;
    [arr[0], arr[heapSize - 1]] = [arr[heapSize - 1], arr[0]];
    heapify(arr, heapSize, 0);
  }

  function buildHeap(array) {
    let heapSize = array.length;
    for (let i = Math.floor(heapSize / 2); i >= 0; i--) {
      heapify(array, heapSize, i);
    }
  }

  function heapify(array, heapSize, i) {
    let left = i * 2 + 1;
    let right = i * 2 + 2;
    let largest = i;

    if (left < heapSize && array[left] > array[largest]) {
      largest = left;
    }

    if (right < heapSize && array[right] > array[largest]) {
      largest = right;
    }

    if (largest != i) {
      [array[i], array[largest]] = [array[largest], array[i]];
      heapify(array, heapSize, largest);
    }
  }
}

const bfs = function (nodes) {
  var result = [];
  var queue = [];
  queue.push(nodes);
  while (queue.length) {
    var item = queue.shift();
    result.push(item.node);
    item.left && queue.push(item.left);
    item.right && queue.push(item.right);
  }
};

function binarySearchTree(array, left, right, target) {
  if (left >= right) return -1;
  let mid = ((left + right) / 2) | 0;
  var value = array[mid];
  if (value === target) return mid;
  if (value < target) return binarySearchTree(array, mid + 1, right, target);
  if (value > target) return binarySearchTree(array, left, mid - 1, target);
}

function TreeNode(value) {
  this.left = null;
  this.right = null;
  this.val = value;
}

function getMax(root: any) {
  let value = 0;
  getOneSideMax(root);
  return value;

  function getOneSideMax(node: any) {
    if (node === null) return 0;
    let left = Math.max(0, getOneSideMax(node.left));
    let right = Math.max(0, getOneSideMax(node.right));
    value = Math.max(value, left + right + node.value);
    return Math.max(left, right);
  }
}

function buildTree(
  preorder: number[],
  preStartIndex: number,
  preEndIndex: number,
  inorder: number[],
  inStartIndex: number,
  inEndIndex: number,
  inMap: object,
) {
  if (preStartIndex > preEndIndex || inStartIndex > inEndIndex) return null;

  let root = new TreeNode(preorder[preStartIndex]);
  let inRootIndex = inMap[root.val];
  let numsLeft = inRootIndex - inStartIndex;

  root.left = buildTree(
    preorder,
    preStartIndex + 1,
    preStartIndex + numsLeft,
    inorder,
    inStartIndex,
    inRootIndex - 1,
    inMap,
  );
  root.right = buildTree(
    preorder,
    preStartIndex + numsLeft + 2,
    preEndIndex,
    inorder,
    inRootIndex + 1,
    inEndIndex,
    inMap,
  );
  return root;
}

function recoverTree(root: any) {
  let prev;
  let t1;
  let t2;
  trverse(root);
  let tmp = t1.val;
  t1.val = t2.val;
  t2.val = tmp;

  function trverse(node) {
    if (node == null) return;
    trverse(node.left);
    // 只有两个节点被错误交换，t1，t2只赋值一次即可
    if (node.val < prev.val) {
      t1 = t1 == null ? prev : t1;
      t2 = node;
    }
    prev = node;
    trverse(node.right);
  }
}

function coinChange(coins: number[], amount: number) {
  function dp(n) {
    if (n == 0) return 0;
    if (n < 0) return -1;
    let res = 0;
    for (const coin of coins) {
      let subChange = dp(n - coin);
      if (subChange === -1) continue;
      res = Math.min(res, 1 + subChange);
    }
    return res != 0 ? res : -1;
  }
  return dp(amount);
}

function coinCHange(coins: number[], amount: number) {
  function dp(n) {
    if (n == 0) return 0;
    if (n < 0) return -1;
    let res = 0;
    for (const coin of coins) {
      let subAmount = dp(n - coin);
      if (subAmount == -1) continue;
      res = Math.min(res, subAmount);
    }
    return res != 0 ? res : -1;
  }
  return dp(amount);
}

let res;
function backTrack(nums: number[], track: any) {
  if (track.size() === nums.length) {
    res.add(track);
    return;
  }

  for (let i = 0; i < nums.length; i++) {
    const ele = nums[i];
    if (track.contains(ele)) continue;
    track.add(ele);
    backTrack(nums, track);
    track.removeLast();
  }
}

function fib(n: number) {
  if (n < 1) return 0;
  let memo = Array.from({ length: n + 1 }, (v) => 0);
  return helper(memo, n);
  function helper(memo, n) {
    if (n == 1 || n == 2) return 1;
    if (memo[n] != 0) return memo[n];
    memo[n] = helper(memo, n - 1) + helper(memo, n - 2);
    return memo[n];
  }
}

function fibArr(n: number) {
  if (n < 1) return 0;
  if (n == 2 || n == 1) return 1;

  let prev = 1;
  let cur = 1;
  for (let i = 3; i <= n; i++) {
    let sum = prev + cur;
    prev = cur;
    cur = sum;
  }

  return cur;
}

function coinChangeSync(coins: number[], amount: number) {
  let dp = Array.from({ length: amount + 1 }).map((i) => amount + 1);
  dp[0] = 0;
  for (let i = 0; i < dp.length; i++) {
    const element = dp[i];
    for (const coin of coins) {
      if (i - coin < 0) continue;
      dp[i] = Math.min(dp[i], 1 + dp[i - coin]);
    }
  }
  return dp[amount] == amount + 1 ? -1 : dp[amount];
}

function permute(nums: number[]) {
  let track = [];
  let res;
  backtrack(nums, track);
  return res;

  function backtrack(nums, track) {
    if (track.length == nums.length) {
      res.push(...track);
      return;
    }

    for (let i = 0; i < nums.length; i++) {
      if (track.contains(nums[i])) continue;

      track.push(nums[i]);
      backtrack(nums, track);
      track.pop();
    }
  }
}

// function bfS(start, target) {
//   let q;
//   let visited:Set<any>;

//   q.push(start);
//   visited.add(start);
//   let step=0;

//   while(q not empty){
//     let l=q.size();
//     for(let i=0;i<l;i++){
//       let cur=q.shift();
//       if(cur is target) return step;
//       for(x of cur.adj()){
//         if(!visited.has(x)){
//           q.push(x);
//           visited.add(x)
//         }
//       }
//     }
//     step++;
//   }
// }

function minDepth(root) {
  if (root == null) return 0;
  let q = [];
  q.push(root);
  let depth = 1;

  while (q.length != 0) {
    let l = q.length;
    for (let i = 0; i < l; i++) {
      let cur = q.shift();
      if (cur.left == null && cur.right == null) return depth;
      if (cur.left != null) q.push(cur.left);
      if (cur.right != null) q.push(cur.right);
    }
    depth++;
  }
}

function openLock(deadends: string[], target: string) {
  function moveOne(s, index, dir) {
    const target = s[index];
    let str;
    if (dir > 0) {
      str = target === "9" ? "0" : target + 1;
    } else {
      str = target === "0" ? "9" : target - 1;
    }
    return str;
  }
  const deads = new Set();
  deadends.forEach((end) => {
    deads.add(end);
  });

  const visited = new Set();
  const q = [];
  let step = 0;
  q.push("0000");
  visited.add("0000");

  while (q.length > 0) {
    let len = q.length;
    for (let i = 0; i < len; i++) {
      let cur = q.shift();
      if (deads.has(cur)) continue;
      if (cur === target) return step;

      for (let j = 0; j < 4; j++) {
        let up = moveOne(cur, j, 1);
        if (!visited.has(up)) {
          q.push(up);
          visited.add(up);
        }
        let down = moveOne(cur, j, -1);
        if (!visited.has(down)) {
          q.push(down);
          visited.add(down);
        }
      }
    }

    step++;
  }

  return -1;
}

function left_bound(nums, target) {
  let left = 0;
  let right = nums.length;
  while (left < right) {
    let mid = (left + (right - left) / 2) | 0;
    if (nums[mid] < target) {
      left = mid + 1;
    } else if (nums[mid] > target) {
      right = mid - 1;
    } else if (nums[mid] == target) {
      right = mid - 1;
    }
  }

  if (left >= nums.length || nums[left] != target) return -1;
  return left;
}

function sidingwindow(s, t) {
  let need = new Map();
  let window = new Map();

  for (let i = 0; i < t.length; i++) {
    const tar = t[i];
    window[tar] = i;
  }

  let left = 0,
    right = 0,
    valid = 0;
  let start = 0;
  let len = Infinity;

  while (right < s.length) {
    let c = s[right];
    right++;

    if (need.has(c)) {
      window[c] = window[c] ? window[c] + 1 : 0;
      if (window[c] == need[c]) {
        valid++;
      }
    }
    //...

    while (valid == need.size) {
      if (right - left < len) {
        start = left;
        len = right - left;
      }
      let d = s[left];
      left++;
      if (need.has(d) && window[d] == need[d]) {
        valid--;
        window[d]--;
      }
      // ...
    }
  }

  return len == Infinity ? -1 : len - start;
}

function checkInclusion(s: string) {
  let window = new Map();
  let left = 0,
    right = 0;
  let res = 0;

  while (right < s.length) {
    let c = s[right];
    window[c] = window[c] ? window[c] + 1 : 1;

    while (window[c] > 1) {
      let d = s[left];
      left++;
      window[d]--;
    }

    res = Math.max(res, right - left);
  }
  return res;
}

function removeCoveredIntervals(intvs: number[][]) {
  intvs.sort((a, b) => {
    if (a[0] == b[0]) return b[1] - a[1];
    return a[0] - b[0];
  });

  let left = intvs[0][0];
  let right = intvs[0][1];

  let res = 0;

  for (let i = 0; i < intvs.length; i++) {
    const intv = intvs[i];

    if (left <= intv[0] && right >= intv[1]) {
      res++;
    }
    if (right >= intv[0] && right <= intv[1]) {
      right = intv[1];
    }

    if (right < intv[0]) {
      left = intv[0];
      right = intv[1];
    }

    return intvs.length - res;
  }
}

function twoSum(nums: number[], target: number) {
  nums.sort();

  let res = [];
  let left = 0;
  let right = nums.length - 1;

  while (left < right) {
    let sum = nums[left] + nums[right];

    let l = nums[left],
      r = nums[right];
    if (sum > target && nums[right] == r) {
      right--;
    } else if (sum < target && nums[left] == l) {
      left++;
    } else {
      res.push([left, right]);
      while (left < right && nums[left] == l) left++;
      while (left < right && nums[right] == r) right--;
    }
  }

  return res;
}

function reverseListTotal(head) {
  if (head.next == null) return head;
  let last = reverseListTotal(head.next);
  head.next.next = head;
  head.next = null;
  return last;
}

let detail;
function reverseN(head, n) {
  if (n == 1) {
    detail = head.next;
    return head;
  }

  let last = reverseN(head, n - 1);

  head.next.next = head;
  head.next = detail;
  return last;
}

function reverseMN(head, m, n) {
  if (m == 1) {
    return reverseN(head, n);
  }
  head.next = reverseMN(head, m - 1, n - 1);
  return head;
}

function reverseAtoB(a, b) {
  let pre = null,
    cur = a,
    next = a;
  while (cur != b) {
    next = cur.next;
    cur.next = pre;
    pre = cur;
    cur = next;
  }
  return pre;
}

function reverseKGroup(head, k) {
  if (head == null) return null;

  let a = head,
    b = head;

  for (let i = 0; i < k; i++) {
    if ((b = null)) return head;
    b = head.next;
  }

  let newHead = reverseAtoB(a, b);
  a.next = reverseKGroup(b, k);
  return newHead;
}

function palindrome(s, l, r) {
  while (l >= 0 && r < s.length && s[l] == s[r]) {
    l++;
    r--;
  }
  return s.slice(l, r + 1);
}

function isPalindrome(s) {
  let left = 0;
  let right = s.length - 1;
  while (left <= right) {
    if (s[left] !== s[right]) return false;
    left++;
    right--;
  }
  return true;
}

function isPalindromeLink(head) {
  let right = reverseLink(head);

  while (right != null) {
    if (head.val !== right.val) return false;
    head = head.next;
    right = right.next;
  }
  return true;
}

function reverseLink(head) {
  let pre = null,
    cur = head,
    next = head;

  while (cur != null) {
    next = cur.next;
    cur.next = pre;
    pre = cur;
    cur = next;
  }
  return pre;
}

function invertTree(root) {
  if (root == null) return null;
  let tmp = root.left;
  root.left = root.right;
  root.right = tmp;

  invertTree(root.left);
  invertTree(root.right);
  return root;
}

function connectTwoNode(node1, node2) {
  if (node1 == null || node2 == null) return;

  node1.next = node2;

  connectTwoNode(node1.left, node1.right);
  connectTwoNode(node2.left, node2.right);
  connectTwoNode(node1.right, node2.left);
}

function flatten(root) {
  if (root == null) return;

  flatten(root.left);
  flatten(root.right);

  let left = root.left;
  let right = root.right;

  root.right = left;
  root.left = null;

  let p = root;
  while (p.right !== null) {
    p = p.right;
  }

  p.right = right;
}

function getMaxTree(arr) {
  if (arr.length == 0) return null;
  let maxVal;
  let maxIndex;

  for (let i = 0; i < arr.length; i++) {
    const element = arr[i];
    if (element > maxVal) {
      maxVal = element;
      maxIndex = i;
    }
  }

  let root = new Node() as any;

  root.left = getMaxTree(arr.slice(0, maxIndex));
  root.right = getMaxTree(arr.slice(maxIndex + 1, arr.length));
}

function getMaxChildNode(node) {
  let memo = new Map();
  let result = [];
  traverse(node);
  return result;

  function traverse(root) {
    let left = traverse(root.left);
    let right = traverse(root.right);

    let subTree = `${left}-${right}-${root.val}`;

    if (memo[subTree] && memo[subTree] == 1) {
      result.push(subTree);
      memo[subTree]++;
    } else {
      memo[subTree] = memo[subTree] ? memo[subTree] + 1 : 1;
    }
    return subTree;
  }
}

function kthSmallest(root, k) {
  let res;
  let rank = 0;
  traverse(root, k);
  return res;

  function traverse(root, k) {
    traverse(root.left, k);

    rank++;
    if (rank == k) {
      res = root.val;
      return;
    }

    traverse(root.right, k);
  }
}

function buildNewTree(low, high) {
  let res = [];

  if (low > high) {
    res.push(null);
    return res;
  }

  for (let i = low; i <= high; i++) {
    let leftTree = buildNewTree(low, i - 1);
    let rightTree = buildNewTree(i + 1, high);

    for (const left of leftTree) {
      for (const right of rightTree) {
        let root = new Node() as any;
        root.left = left;
        root.right = right;
        res.push(root);
      }
    }
  }
  return res;
}

function mapTraverse() {
  let visited = [];
  function traverse(graph, s: number) {
    if (visited[s]) return;

    visited[s] = true;

    for (const gra of graph[s]) {
      traverse(gra, s);
    }

    visited[s] = false;
  }
}

function allPaths(graph: number[][]) {
  let res = [];

  traverse(graph, 0, []);
  return res;

  function traverse(graph, n, path) {
    path.push(n);

    let l = graph.length;
    if (n == l - 1) {
      res.push([path]);
      path.pop();
      return;
    }

    for (const gra of graph[n]) {
      traverse(graph, gra, path);
    }

    path.pop();
  }
}

function lowestCommon(root, p, q) {
  if (root == null) return null;

  if (root == p || root == q) return root;

  let left = lowestCommon(root.left, p, q);
  let right = lowestCommon(root.right, p, q);

  if (left != null && right != null) return root;

  if (left == null && right == null) return null;

  return left == null ? right : left;
}

function kekeBanaer(piles: number[], h: number) {
  let left = 1;
  let right = Math.max(...piles) + 1;

  while (left < right) {
    let mid = ((left + right) / 2) | 0;
    if (canFinish(piles, mid, h)) {
      right = mid;
    } else {
      left = mid + 1;
    }
  }
  return left;

  function canFinish(piles: number[], speed: number, hour: number) {
    let time = 0;
    for (const pile of piles) {
      time += Math.ceil(pile / speed);
    }
    return time < hour;
  }
}

function removeDuplicates(nums: number[]) {
  if (nums.length === 0) return null;
  let slow = 0,
    fast = 0;

  while (fast < nums.length) {
    if (nums[slow] != nums[fast]) {
      slow++;
      nums[slow] = nums[fast];
    }
    fast++;
  }
  return slow + 1;
}
function hasCycle(root) {
  let fast = root,
    slow = root;
  while (fast !== null && slow !== null) {
    fast = fast.next.next;
    slow = slow.next;
    if (fast == slow) break;
  }

  if (fast == null || slow == null) return null;

  slow = root;

  while (fast !== slow) {
    fast = fast.next;
    slow = slow.next;
  }
  return slow;
}

function split(nums: number[], max: number) {
  let count = 1;
  let sum = 0;
  for (let i = 0; i < nums.length; i++) {
    const ele = nums[i];

    if (sum + ele > max) {
      count++;
      sum = ele;
    } else {
      sum += ele;
    }
  }
  return count;
}

function minFillingPath(matrix: number[][]) {
  let n = matrix.length;
  let res = 0;
  let memo = Array.from({ length: n }).map((m) => {
    return Array.from({ length: n }).map((i) => 11111);
  });

  for (let j = 0; j < n; j++) {
    res = Math.min(res, dp(matrix, n - 1, j));
  }
  return res;

  function dp(matrix, i, j) {
    if (i < 0 || j < 0 || i >= n || j >= n) return "over";

    if (i == 0) return matrix[0][j];

    if (memo[i][j] !== 11111) {
      return memo[i][j];
    }

    memo[i][j] += Math.min(
      memo[i - 1][j],
      memo[i - 1][j - 1],
      memo[i - 1][j + 1],
    );
    return memo[i][j];
  }
}

function longestPalindromeSubseq(str) {
  let n = str.length;
  const dp = Array.from({ length: n }).map((i) => {
    return Array.from({ length: n }).map((j) => 0);
  });

  for (let i = 0; i < n; i++) {
    dp[i][i] = 1;
  }

  for (let i = n - 2; i >= 0; i--) {
    let res = 0;
    for (let j = i + 1; j < n; j++) {
      if (str[i] == str[j]) {
        dp[i][j] = dp[i + 1][j - 1] + 2;
      } else {
        dp[i][j] = Math.max(dp[i + 1][j], dp[i][j - 1]);
      }
    }
  }
  return dp[0][n - 1];
}

function findTargetSubWays(nums: number[], target: number) {
  let result = 0;
  if (nums.length == 0) return 0;
  backTrack(nums, 0, target);
  return result;

  function backTrack(nums, i, rest) {
    if (i == nums.length) {
      if (rest == 0) result++;
    }

    rest += nums[i];
    backTrack(nums, i + 1, rest);
    rest -= nums[i];

    rest -= nums[i];
    backTrack(nums, i + 1, rest);
    rest += nums[i];
  }
}

function findtargetsubways(nums: number[], target: number) {
  if (nums.length == 0) return 0;
  const memo = new Map();
  return dp(nums, 0, target);

  function dp(nums, i, rest) {
    if (i == nums.length) {
      if (rest == 0) {
        return 1;
      }
      return 0;
    }

    let key = `${i},${rest}`;

    if (memo.has(key)) {
      return memo.get(key);
    }

    let result =
      dp(nums, i + 1, rest - nums[i]) + dp(nums, i + 1, rest + nums[i]);

    memo.set(key, result);
    return result;
  }
}

function getLenghtOfLis(nums: number[]) {
  let dp = Array.from({ length: nums.length }).map((i) => 1);

  for (let i = 0; i < nums.length; i++) {
    const ele = nums[i];
    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i]) {
        dp[i] = Math.max(dp[i], dp[j] + 1);
      }
    }
  }
  return Math.max(...dp);
}

function maxSubArray(nums: number[]) {
  let n = nums.length;
  if (n == 0) return 0;
  const dp: number[] = Array.from({ length: n });
  dp[0] = nums[0];

  for (let i = 1; i < n; i++) {
    dp[i] = Math.max(nums[i], dp[i - 1] + nums[i]);
  }
  return Math.max(...dp);
}

function longestCommonSubSequence(s1: string, s2: string) {
  const m = s1.length;
  const n = s2.length;
  const memo = Array.from({ length: m }).map((i) => {
    return Array.from({ length: n }).map((j) => -1);
  });

  return dp(s1, 0, s2, 0);

  function dp(s1, i, s2, j) {
    if (i == s1.length || j == s2.length) return 0;

    if (memo[i][j] != -1) {
      return memo[i][j];
    }

    if (s1 == s2) {
      memo[i][j] = 1 + dp(s1, i + 1, s2, j + 1);
    } else {
      memo[i][j] = Math.max(dp(s1, i, s2, j + 1), dp(s1, i + 1, s2, j));
    }
    return memo[i][j];
  }
}

function knasp(w: number, n: number, wt: number[], val: number[]) {
  const dp = Array.from({ length: w + 1 }).map((i) => {
    return Array.from({ length: n + 1 }).map((j) => 0);
  });

  // dp[i][j] 前i个物品，背包容量w，最大价值dp[i][j]
  for (let i = 1; i < n; i++) {
    for (let j = 1; j < w; j++) {
      if (j < wt[i - 1]) {
        dp[i][j] = dp[i - 1][j];
      } else {
        dp[i][j] = Math.max(
          dp[i - 1][j],
          dp[i - 1][w - wt[i - 1]] + val[i - 1],
        );
      }
    }
  }
}

function canSplit(nums: number[]) {
  let sum;
  let dp;
  for (let i = 0; i < nums.length; i++) {
    dp[i][0] = true;
  }

  for (let i = 1; i < nums.length; i++) {
    for (let j = 1; j < sum; j++) {
      if (j < nums[i - 1]) {
        dp[i][j] = dp[i - 1][j];
      } else {
        dp[i][j] = dp[i - 1][j] || dp[i][j - nums[i - 1]];
      }
    }
  }

  return dp[nums.length][sum];
}

function change(amount: number, coins: number[]) {
  const n = coins.length;
  const dp: number[][] = Array.from({ length: n + 1 }).map((i) => {
    return Array.from({ length: amount + 1 });
  });

  for (let i = 0; i < n; i++) {
    dp[i][0] = 1;
  }

  for (let i = 1; i < n; i++) {
    for (let j = 1; j < amount; j++) {
      if (j < coins[i - 1]) {
        dp[i][j] = dp[i - 1][j];
      } else {
        dp[i][j] = dp[i - 1][j] + dp[i][j - coins[i - 1]];
      }
    }
  }

  return dp[n][amount];
}

function changeBetter(amount, coins) {
  const n = coins.length;
  const dp: number[] = Array.from({ length: amount + 1 });
  dp[0] = 1;

  for (let i = 1; i < n; i++) {
    for (let j = 1; j < amount; i++) {
      if (j >= coins[i - 1]) {
        dp[j] += dp[j - coins[i - 1]];
      }
    }
  }

  return dp[amount];
}

function intervalSchedule(intvs: number[][]) {
  if (intvs.length == 0) return 0;

  intvs.sort((a, b) => {
    return a[1] - b[1];
  });

  let count = 1;
  let endN = intvs[0][1];
  for (let i = 1; i < intvs.length; i++) {
    const start = intvs[i][0];
    if (start > endN) {
      count++;
      endN = intvs[i][1];
    }
  }
  return count;
}

function jump(nums: number[]) {
  let l = nums.length;
  let step = 0;
  let end = 0;
  let fastest = 0;

  for (let i = 0; i < l; i++) {
    fastest = Math.max(fastest, i + nums[i]);
    if (end == i) {
      step++;
      end = fastest;
    }
  }
  return step;
}

function minPath(nums: number[][]) {
  let m = nums.length;
  let n = nums[0].length;

  const memo = Array.from({ length: m }).map((i) => {
    return Array.from({ length: n }).map((j) => -1);
  });

  return dp(nums, m - 1, n - 1);

  function dp(nums, i, j) {
    if (i == 0 && j == 0) return nums[0][0];
    if (memo[i][j] == -1) return memo[i][j];

    memo[i][j] = Math.min(dp[i - 1][j], dp[i][j - 1]) + nums[i][j];
    return memo[i][j];
  }
}

function superEggDrop(eggNum: number, floorNum: number) {
  const memo = Array.from({ length: eggNum }).map((i) => {
    return Array.from({ length: floorNum }).map((j) => -1);
  });

  let i = 1,
    j = 1;

  for (; memo[i][j] < floorNum; i++) {
    for (; j < floorNum; j++) {
      memo[i][j] = memo[i - 1][j - 1] + memo[i][j - 1] + 1;
    }
  }
  return j;
}

function maxCoins(nums: number[]) {
  let n = nums.length;

  let points = Array.from({ length: n + 2 }).map((i: number) => {
    return i == 0 || i == n + 1 ? 1 : nums[i - 1];
  });

  const memo = Array.from({ length: n + 2 }).map((i) => {
    return Array.from({ length: n + 2 }).map((j) => 0);
  });

  for (let i = n; i >= 0; i--) {
    for (let j = i + 1; j < n + 2; j++) {
      for (let k = i + 1; k < j; k++) {
        memo[i][j] =
          points[i] * points[k] * points[j] + memo[i][k] + memo[k][j];
      }
    }
  }

  return memo[n - 1][n - 1];
}

function stoneGame(piles: number[]) {
  let n = piles.length;

  const dp = Array.from({ length: n }).map((i) => {
    return Array.from({ length: n }).map((j) => {
      return {
        fir: 0,
        sec: 0,
      };
    });
  });

  for (let i = 0; i < n; i++) {
    dp[i][i].fir = piles[i];
    dp[i][i].sec = 0;
  }

  for (let l = 2; l <= n; l++) {
    for (let i = 0; i < n; i++) {
      let j = l + i - 1;
      let left = piles[i] + dp[i + 1][j].sec;
      let right = piles[j] + dp[i][j - 1].sec;

      if (left > right) {
        dp[i][j].fir = left;
        dp[i][j].sec = dp[i + 1][j].fir;
      } else {
        dp[i][j].fir = right;
        dp[i][j].sec = dp[i][j - 1].fir;
      }
    }
  }
  let result = dp[0][n - 1];
  return (res.fir = res.sec);
}

function maxA(n: number) {
  const dp: number[] = Array.from({ length: n + 1 });

  dp[0] = 0;

  for (let i = 1; i <= n; i++) {
    dp[i] = i;
    for (let j = 2; i < i; i++) {
      dp[i] = Math.max(dp[i], dp[i - 2] * (i - j + 1));
    }
  }
  return dp[n];
}

function kmp(text: string, pattern: string) {
  let i = 0;
  let j = 0;
  let next = getNext(pattern);
  while (i < text.length && j < pattern.length) {
    if (j == -1 || text[i] == pattern[j]) {
      i++;
      j++;
    } else {
      j = next[j];
    }
  }

  function getNext(pattern: string) {
    let n = pattern.length;
    let dp: number[] = Array.from({ length: n });
    let i = 0;
    let j = -1;

    while (i < n - 1) {
      if (j == -1 || pattern[i] == pattern[j]) {
        i++;
        j++;
        next[i] = j;
      } else {
        j = next[j];
      }
    }
    return next;
  }

  if (j == pattern.length) return i - 1;
  return -1;
}

function minInsertions(s: string) {
  let n = s.length;
  let dp = Array.from({ length: n }).map((i) => {
    return Array.from({ length: n }).map((j) => 0);
  });

  for (let i = n - 1; i >= 0; i--) {
    for (let j = i + 1; j < n; j++) {
      if (s[i] == s[j]) {
        dp[i][j] = dp[i + 1][j - 1];
      } else {
        dp[i][j] = Math.min(dp[i + 1][j], dp[i][j - 1]) + 1;
      }
    }
  }
  return dp[0][n - 1];
}

function canPartitionSubsets(k: number, nums: number[]) {
  if (k > nums.length) return false;
  const sum = nums.reduce((r, v) => r + v);
  if (sum % k != 0) return false;
  const used: boolean[] = Array.from({ length: k }).map((i) => false);

  return backTrack(k, 0, nums, 0, used, sum / k);
  function backTrack(
    k: number,
    total: number,
    nums: number[],
    start: number,
    used: boolean[],
    target: number,
  ) {
    if (k == 0) return true;

    if (total == target) {
      return backTrack(k - 1, 0, nums, 0, used, target);
    }

    for (let i = start; i < nums.length; i++) {
      const num = nums[i];
      if (used[i]) continue;

      if (num + total > target) continue;

      used[i] = true;
      total += num;
      if (backTrack(k, total, nums, i + 1, used, target)) return true;

      used[i] = false;
      total -= num;
    }
  }
}

function subset(nums: number) {
  let res;
  let track = [];
  backTrack(nums, 0, track);
  return res;

  function backTrack(nums, start, track) {
    res.push(track);

    for (let i = start; i < nums.length; i++) {
      const ele = nums[i];
      track.push(ele);
      backTrack(nums, i + 1, track);
      track.pop();
    }
  }
}

function boardBackTrack(board: any[], i: number, j: number) {
  let m = 9;
  let n = 9;
  if (j == n) {
    boardBackTrack(board, i + 1, 0);
    return;
  }

  if (i == m) return true;

  if (board[i][j] == ".") {
    boardBackTrack(board, i, j + 1);
    return;
  }

  for (let str: any = "1"; str < "9"; str++) {
    if (!isValid(board, i, j, str)) continue;

    board[i][j] = str;

    boardBackTrack(board, i, j + 1);
    board[i][j] = ".";
  }
  return false;

  function isValid(board, i, j, str) {
    for (let k = 0; k < 9; k++) {
      if (board[i][k] == str) return false;
      if (board[k][j] == str) return false;
      if (board[i - 1 - Math.floor(k / 3)][j - 1 - (k % 3)] == str)
        return false;
    }
    return true;
  }
}

function generateParenthesis(n: number) {
  if (n == 0) return [];

  let res: string[] = [];
  let track: string = "";

  backTrack(n, n, track, res);

  return res;

  function backTrack(left, right, track, res) {
    if (right < left) return;
    if (right < 0 || left < 0) return;

    if (left == 0 && right == 0) {
      res.push(track);
      return;
    }

    track += "(";
    backTrack(left - 1, right, track, res);
    track = track.slice(0, -1);

    track += ")";
    backTrack(left, right - 1, track, res);
    track = track.slice(0, -1);
  }
}

function minDepths(root) {
  if (root == null) return 0;
  let q = [root];
  let depth = 1;
  while (q.length > 0) {
    let l = q.length;
    for (let i = 0; i < q.length; i++) {
      let head = q.shift();
      if ((head.left = null && head.right == null)) return depth;
      if (head.left != null) q.push(head.left);
      if (head.right != null) q.push(head.left);
    }
    depth++;
  }
  return depth;
}

function slidingPuzlei(board: number[][]) {
  let m = 3;
  let n = 2;

  let start = "";
  let target = "";

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      start += board[i][j] + "0";
    }
  }

  let neibor = [
    [1, 3],
    [0, 2, 4],
    [1, 5],
    [0, 4],
    [1, 3, 5],
    [2, 4],
  ];

  let q = [start];
  let visited = new Set();
  visited.add(start);

  let step = 0;

  while (q.length != 0) {
    for (let i = 0; i < q.length; i++) {
      let cur = q[0];
      q.shift();
      if (target == cur) return step;
      let index = 0;
      while (cur[index] != "0") {
        index++;
      }

      for (const nei of neibor[index]) {
        let newBoard: any = cur;
        newBoard[nei] = cur[index];
        newBoard[index] = cur[nei];
        if (!visited.has(newBoard)) {
          q.push(newBoard);
          visited.add(newBoard);
        }
      }
    }
    step++;
  }
  return step;
}

function hanmingWeight(n) {
  let res = 0;
  while (n != 0) {
    n = n & (n - 1);
    res++;
  }
  return res;
}

function isPowerOfTwo(n) {
  if (n <= 0) return false;

  return (n & (n - 1)) == 0;
}

function singleNumber(nums: number[]) {
  let res = 0;
  for (const num of nums) {
    res ^= num;
  }
  return res;
}

function trailingZeros(n) {
  let res = 0;
  let devide = 5;
  while (devide < n) {
    res += n / devide;
    devide *= 5;
  }
  return res;
}

function getSizeByK(k) {
  return right_bound(k) - left_bound(k) + 1;
  function left_bound(k) {
    let low = 0;
    let hi = Math.pow(10, 9);
    while (low < hi) {
      let mid = Math.floor((low + hi) / 2);
      if (trailingZeros(mid) < k) {
        low = mid + 1;
      } else {
        hi = mid;
      }
    }
    return low;
  }

  function right_bound(k) {
    let l = 0,
      h = Math.pow(10, 9);
    while (l < h) {
      let mid = ((l + h) / 2) | 0;
      if (trailingZeros(mid) > k) {
        h = mid - 1;
      } else {
        l = mid;
      }
    }
    return h;
  }
}

function countPrimis(n: number) {
  const isPrimis = Array.from({ length: n }).map((i) => true);
  for (let i = 2; i * i < n; i++) {
    if (isPrimis[i]) {
      for (let j = i * i; j < n; j += i) {
        isPrimis[j] = false;
      }
    }
  }

  let count = 0;
  for (let i = 2; i < n; i++) {
    if (isPrimis[i]) count++;
  }
  return count;
}

function getResult(num, k) {
  const base = 1337;
  function mypow(num, k) {
    num %= base;
    if (k % 2 == 1) {
      return (num * mypow(num, k - 1)) % base;
    } else {
      let sub = mypow(num, k / 2);
      return (sub * sub) % base;
    }
  }

  function superPow(a, b: number[]) {
    if (b.length == 0) return 1;
    let last = b.pop();
    let part1 = mypow(a, last);
    let part2 = mypow(superPow(a, b), 10);
    return (part1 * part2) % base;
  }
}

function findErrorItem(nums: number[]) {
  let l = nums.length;
  let dup;
  for (let i = 0; i < l; i++) {
    let index = nums[i] - 1;
    if (nums[index] > 0) {
      dup = nums[index];
    } else {
      nums[index] *= -1;
    }
  }

  let missing = -1;
  for (let i = 0; i < l; i++) {
    if (nums[i] > 0) {
      missing = i + 1;
    }
  }
  return [dup, missing];
}

function getRandom(root, k: number) {
  let res = Array.from({ length: k });
  let p = root;

  for (let i = 0; i < k && p != null; i++) {
    res[i] = p.val;
    p = p.next;
  }

  let j = k;
  while (p != null) {
    let m = (Math.random() * ++j) | 0;

    if (m < k) {
      res[j] = p.val;
    }
    p = p.next;
  }
  return res;
}

function subArraySum(nums: number[], k: number) {
  let n = nums.length;
  const preSum = new Map();
  preSum.set(0, 1);

  let ans = 0;
  let sumI = 0;
  for (let i = 0; i < n; i++) {
    sumI += nums[i];
    let sumJ = sumI - k;

    if (preSum.has(sumJ)) {
      res += preSum.get(sumJ);
    }

    preSum.set(sumJ, preSum.has(sumJ) ? preSum.get(sumJ) + 1 : 1);
  }
}

function diff() {
  let diff = [];
  function difference(nums: number[]) {
    if (nums.length == 0) return null;
    diff = Array.from({ length: nums.length });

    diff[0] = nums[0];

    for (let i = 1; i < nums.length; i++) {
      diff[i] = nums[i] - nums[i - 1];
    }
  }

  function increace(i, j, val: number) {
    diff[i] += val;
    if (j + 1 < diff.length) {
      diff[j + 1] -= val;
    }
  }

  function result(diff: number[]) {
    let res: number[] = Array.from({ length: diff.length });
    res[0] = diff[0];
    for (let i = 1; i < diff.length; i++) {
      res[i] = res[i - 1] + diff[i];
    }
    return res;
  }
}

function diffWaysToCompute(input: string) {
  let memo = new Map();
  return diff(input);

  function diff(input: string) {
    if (memo.has(input)) {
      return memo.get(input);
    }

    let res = [];

    for (let i = 0; i < input.length; i++) {
      let c = input[i];

      if (c == "-" || c == "+" || c == "*") {
        let left = diff(input.slice(0, i));
        let right = diff(input.slice(i + 1));
        for (const l of left) {
          for (const r of right) {
            if (c == "-") {
              res.push(l - r);
            } else if (c == "*") {
              res.push(l * r);
            } else if (c == "+") {
              res.push(l + r);
            }
          }
        }
      }
    }

    if (res.length == 0) return Number(input);
    memo.set(input, res);
    return res;
  }
}
