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
