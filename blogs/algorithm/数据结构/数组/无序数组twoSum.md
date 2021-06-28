# 无序数组 twoSum

一个数组 nums 和一个目标 target，请你返回 nums 中能够凑出 target 的两个元素的值

```typescript
function twoSum(nums: number[], target: number) {
  let map = new Map();
  for (let i = 0; i < nums.length; i++) {
    map.set(nums[i], i);
  }

  for (let i = 0; i < nums.length; i++) {
    let other = target - nums[i];
    // 防止 3+3=6的情况
    if (map.get(other) && map.get(other) != i) {
      return [i, map.get(other)];
    }
  }

  return [-1, -1];
}
```

## 设计一个类

拥有两个 API

```typescript
class TwoSum {
  // 向数据结构中添加一个数 number
  public add(number: number);
  // 寻找当前数据结构中是否存在两个数的和为 value
  public find(value: number);
}
```

对于普通需求：

```typescript
class TwoSum {
  freq = new HashMap();
  // 向数据结构中添加一个数 number
  add(number: number) {
    freq.set(number, freq.get(number) ? freq.get(number) + 1 : 1);
  }
  // 寻找当前数据结构中是否存在两个数的和为 value
  find(value: number) {
    for (const key of keys) {
      let other = value - key;
      // 3+3=6
      if (other == key && freq.get(key) > 1) return true;
      // 2+4 =6
      if (other != key && freq.has(other)) return true;
    }
    return false;
  }
}
```

对于频繁使用 find 方法的场景，可以借助哈希集合来针对性优化 find 方法

```typescript
class TwoSum {
    let sum=new HashSet()
    let nums=[]
  // 向数据结构中添加一个数 number
  public add(number: number){
      for (const num of nums) {
          sum.add(n+number)
      }
      nums.add(number)
  }
  // 寻找当前数据结构中是否存在两个数的和为 value
  public find(value: number){
      return sum.has(value)
  }
}

```

sum 中存储了所有加入数组可能组成的和，每次 find 只要花费 O(1)时间查找
