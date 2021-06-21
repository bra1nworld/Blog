# nSum 问题

## 一、twoSum 问题

一个数组 nums 和一个目标 target，请你返回 nums 中能够凑出 target 的两个元素的值

```typescript
// 可以先对nums排序，然后利用前文双指针技巧，从两端相向而行就行了

function twoSum(nums: number[], target: number) {
  // 先对数组排序
  nums.sort();

  // 左右指针
  let left = 0,
    right = nums.length - 1;
  while (left < right) {
    let sum = nums[left] + nums[right];
    // 根据sum和target的比较，移动左右指针
    if (sum < target) {
      left++;
    } else if (sum > target) {
      right--;
    } else if (sum == target) {
      return [left, right];
    }
  }
  return [];
}
```

### 修改条件

**nums 中可能有多对元素之和都等于 target，请返回所有和为 target 的元素对，其中不能出现重复**。[1,3][3,1]算作重复

首先，基本思路还是排序加双指针：

```typescript
function twoSumTarget(nums: number[], target: number) {
  nums.sort();
  let res: number[][] = [];
  let left = 0,
    right = nums.length - 1;
  while (left < right) {
    let sum = nums[left] + nums[right];
    if (sum < target) {
      left++;
    } else if (sum > target) {
      right--;
    } else {
      res.push([left, right]);
      left++;
      right--;
    }
  }
  return res;
}
```

这样会造成重复的结果，比如 nums=[1,1,1,2,3,3,4],target=4,得到的结果中[1,3]肯定会重复

出问题的地方在于 sum=target 条件的 if 分支，当给 res 加入一次结果后，left 和 right 不应该只改变 1，而应该跳过所有重复元素。所以对双指针 while 循环作出如下修改：

```typescript
function twoSumTarget(nums: number[], target: number) {
  nums.sort();
  let res: number[][] = [];
  let left = 0,
    right = nums.length - 1;
  while (left < right) {
    let sum = nums[left] + nums[right];
    let l = nums[left],
      r = nums[right];
    if (sum < target) {
      while (left < right && nums[left] == l) left++;
    } else if (sum > target) {
      while (left < right && nums[right] == r) right--;
    } else {
      res.push([left, right]);
      // 跳过所有重复元素
      while (left < right && nums[left] == l) left++;
      while (left < right && nums[right] == r) right--;
    }
  }
  return res;
}
```

时间复杂度是 O(N),排序的时间复杂度是 O(NlogN),所以这个函数的时间复杂度是 O(NlogN)

## 3Sum 问题

```typescript
function twoSumTarget(nums: number[],start:number target: number) {
  nums.sort();
  let res: number[][] = [];
  let left = start,
    right = nums.length - 1;
  // ...
}

function threeSumTarget(nums,target){
    nums.sort();
    let l=nums.length;
    let res=[];
    for (let i = 0; i < n; i++) {
        // 对target - nums[i] 计算twoSum
        tuples=twoSumTarget(nums,i+1,target-nums[i])
        for (const tuple of tuples) {
            tuple.push(nums[i])
            res.push(tuple)
        }
        // 跳过第一个数字重复的情况，否则会出现重复结果
        while(i<n-1 && nums[i] == nums[i+1]) i++
    }
}
```

## nSum

```typescript
function nSumTarget(nums, n, target) {
  nums.sort();
  return sum(nums, n, 0, target);
}

function sumFunc(nums, n, start, target) {
  let l = nums.length;
  let res: number[][] = [];
  if (n < 2 || l < n) return res;
  if (n == 2) {
    let left = 0,
      right = nums.length - 1;
    while (left < right) {
      let sum = nums[left] + nums[right];
      let l = nums[left],
        r = nums[right];
      if (sum < target) {
        while (left < right && nums[left] == l) left++;
      } else if (sum > target) {
        while (left < right && nums[right] == r) right--;
      } else {
        res.push([left, right]);
        // 跳过所有重复元素
        while (left < right && nums[left] == l) left++;
        while (left < right && nums[right] == r) right--;
      }
    }
  } else {
    // n>2时，递归计算(n-1)Sum的结果
    for (let i = start; i < l; i++) {
      let subArr = sumFunc(nums, n - 1, i + 1, target - nums[i]);
      for (const arr of subArr) {
        // (n-1)Sum加上nums[i]就是nSum
        arr.push(nums[i]);
        res.push(arr);
      }
      while (i < l - 1 && nums[i] == nums[i + 1]) i++;
    }
  }
  return res;
}
```
