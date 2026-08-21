/**
 * Role-Based Coding & RTL Assessment Bank
 * Specializations:
 * 1. SWE: CSE, IT, CS Design, MNC (Data Structures & Algorithmic Problem Solving)
 * 2. ANALYST: MNC, CSE, IT (Data Analytics, Matrix Traversal, Strings & Aggregations)
 * 3. HARDWARE_VERILOG: ECE, EV (Verilog / SystemVerilog RTL Design, FSM, FIFO, PWM Controllers)
 * 4. ROBOTICS: Robotics Engineer (ECE / Mechanical / EV: PID Controllers, Kinematics, Sensor Fusion, A* Navigation)
 */

export const dsaProblemBank = {
  SWE: [
    {
      id: "swe_1",
      title: "Two Sum Target Indices",
      difficulty: "Easy",
      timeLimitMinutes: 7,
      topic: "Arrays & Hash Maps",
      description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.`,
      examples: [
        {
          input: "nums = [2, 7, 11, 15], target = 9",
          output: "[0, 1]",
          explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
        },
        {
          input: "nums = [3, 2, 4], target = 6",
          output: "[1, 2]",
          explanation: "Because nums[1] + nums[2] == 6, we return [1, 2]."
        }
      ],
      constraints: [
        "2 <= nums.length <= 10^4",
        "-10^9 <= nums[i] <= 10^9",
        "Only one valid answer exists.",
        "Expected Time Complexity: O(n)",
        "Expected Space Complexity: O(n)"
      ],
      starterCode: {
        python: `def twoSum(nums: list[int], target: int) -> list[int]:
    # Write your code here
    return []`,
        cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    // Write your code here
    return {};
}`,
        javascript: `function twoSum(nums, target) {
    // Write your code here
    return [];
}`,
        java: `import java.io.*;
import java.util.*;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your code here
        return new int[]{};
    }
}`
      },
      testCases: [
        { input: "[2, 7, 11, 15], 9", expected: "[0, 1]" },
        { input: "[3, 2, 4], 6", expected: "[1, 2]" },
        { input: "[3, 3], 6", expected: "[0, 1]" }
      ],
      expectedComplexity: "O(n)"
    },
    {
      id: "swe_2",
      title: "Valid Parentheses & Bracket Matching",
      difficulty: "Easy-Medium",
      timeLimitMinutes: 10,
      topic: "Stacks & Strings",
      description: `Given a string \`s\` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
      examples: [
        { input: 's = "()"', output: "true" },
        { input: 's = "()[]{}"', output: "true" },
        { input: 's = "(]"', output: "false" }
      ],
      constraints: [
        "1 <= s.length <= 10^4",
        "Expected Time Complexity: O(n)",
        "Expected Space Complexity: O(n)"
      ],
      starterCode: {
        python: `def isValid(s: str) -> bool:
    # Write your code here
    return False`,
        cpp: `#include <iostream>
#include <string>
#include <vector>
using namespace std;

bool isValid(string s) {
    // Write your code here
    return false;
}`,
        javascript: `function isValid(s) {
    // Write your code here
    return false;
}`,
        java: `import java.io.*;
import java.util.*;

class Solution {
    public boolean isValid(String s) {
        // Write your code here
        return false;
    }
}`
      },
      testCases: [
        { input: '"()"', expected: "true" },
        { input: '"()[]{}"', expected: "true" },
        { input: '"(]"', expected: "false" }
      ],
      expectedComplexity: "O(n)"
    },
    {
      id: "swe_3",
      title: "Longest Substring Without Repeating Characters",
      difficulty: "Medium",
      timeLimitMinutes: 12,
      topic: "Sliding Window & Hash Sets",
      description: `Given a string \`s\`, find the length of the longest substring without duplicate characters.`,
      examples: [
        { input: 's = "abcabcbb"', output: "3", explanation: 'The answer is "abc", with the length of 3.' },
        { input: 's = "bbbbb"', output: "1" }
      ],
      constraints: [
        "0 <= s.length <= 5 * 10^4",
        "Expected Time Complexity: O(n)"
      ],
      starterCode: {
        python: `def lengthOfLongestSubstring(s: str) -> int:
    # Write your code here
    return 0`,
        cpp: `#include <iostream>
#include <string>
#include <vector>
#include <algorithm>
using namespace std;

int lengthOfLongestSubstring(string s) {
    // Write your code here
    return 0;
}`,
        javascript: `function lengthOfLongestSubstring(s) {
    // Write your code here
    return 0;
}`,
        java: `import java.io.*;
import java.util.*;

class Solution {
    public int lengthOfLongestSubstring(String s) {
        // Write your code here
        return 0;
    }
}`
      },
      testCases: [
        { input: '"abcabcbb"', expected: "3" },
        { input: '"bbbbb"', expected: "1" }
      ],
      expectedComplexity: "O(n)"
    },
    {
      id: "swe_4",
      title: "Merge Overlapping Intervals",
      difficulty: "Medium-Hard",
      timeLimitMinutes: 15,
      topic: "Intervals & Sorting",
      description: `Given an array of \`intervals\` where \`intervals[i] = [start_i, end_i]\`, merge all overlapping intervals and return non-overlapping intervals.`,
      examples: [
        { input: "intervals = [[1,3],[2,6],[8,10],[15,18]]", output: "[[1,6],[8,10],[15,18]]" }
      ],
      constraints: ["Expected Time Complexity: O(n log n)"],
      starterCode: {
        python: `def merge(intervals: list[list[int]]) -> list[list[int]]:
    # Write your code here
    return []`,
        cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

vector<vector<int>> merge(vector<vector<int>>& intervals) {
    // Write your code here
    return {};
}`,
        javascript: `function merge(intervals) {
    // Write your code here
    return [];
}`,
        java: `import java.io.*;
import java.util.*;

class Solution {
    public int[][] merge(int[][] intervals) {
        // Write your code here
        return new int[][]{};
    }
}`
      },
      testCases: [
        { input: "[[1,3],[2,6],[8,10],[15,18]]", expected: "[[1,6],[8,10],[15,18]]" }
      ],
      expectedComplexity: "O(n log n)"
    },
    {
      id: "swe_5",
      title: "Trapping Rain Water Elevation Map",
      difficulty: "Hard",
      timeLimitMinutes: 15,
      topic: "Two Pointers & Dynamic Programming",
      description: `Given \`n\` non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.`,
      examples: [
        { input: "height = [0,1,0,2,1,0,1,3,2,1,2,1]", output: "6" },
        { input: "height = [4,2,0,3,2,5]", output: "9" }
      ],
      constraints: ["Expected Time Complexity: O(n)", "Expected Space Complexity: O(1)"],
      starterCode: {
        python: `def trap(height: list[int]) -> int:
    # Write your code here
    return 0`,
        cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int trap(vector<int>& height) {
    // Write your code here
    return 0;
}`,
        javascript: `function trap(height) {
    // Write your code here
    return 0;
}`,
        java: `import java.io.*;
import java.util.*;

class Solution {
    public int trap(int[] height) {
        // Write your code here
        return 0;
    }
}`
      },
      testCases: [
        { input: "[0,1,0,2,1,0,1,3,2,1,2,1]", expected: "6" },
        { input: "[4,2,0,3,2,5]", expected: "9" }
      ],
      expectedComplexity: "O(n)"
    }
  ],

  ANALYST: [
    {
      id: "da_1",
      title: "Missing Number in Consecutive Series",
      difficulty: "Easy",
      timeLimitMinutes: 7,
      topic: "Arrays & Math Summation",
      description: `Given an array \`nums\` containing \`n\` distinct numbers in the range \`[0, n]\`, return the only number in the range that is missing from the array.`,
      examples: [{ input: "nums = [3, 0, 1]", output: "2" }],
      constraints: ["Expected Time Complexity: O(n)"],
      starterCode: {
        python: `def missingNumber(nums: list[int]) -> int:
    # Write your code here
    return 0`,
        cpp: `#include <iostream>
#include <vector>
#include <numeric>
using namespace std;

int missingNumber(vector<int>& nums) {
    // Write your code here
    return 0;
}`,
        javascript: `function missingNumber(nums) {
    // Write your code here
    return 0;
}`,
        java: `import java.io.*;
import java.util.*;

class Solution {
    public int missingNumber(int[] nums) {
        // Write your code here
        return 0;
    }
}`
      },
      testCases: [{ input: "[3, 0, 1]", expected: "2" }],
      expectedComplexity: "O(n)"
    },
    {
      id: "da_2",
      title: "Top K Frequent Elements & Aggregation",
      difficulty: "Easy-Medium",
      timeLimitMinutes: 10,
      topic: "Hash Map & Frequency Sorting",
      description: `Given an integer array \`nums\` and an integer \`k\`, return the \`k\` most frequent elements in descending frequency order.`,
      examples: [{ input: "nums = [1,1,1,2,2,3], k = 2", output: "[1, 2]" }],
      constraints: ["Expected Time Complexity: O(n log k)"],
      starterCode: {
        python: `def topKFrequent(nums: list[int], k: int) -> list[int]:
    # Write your code here
    return []`,
        cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

vector<int> topKFrequent(vector<int>& nums, int k) {
    // Write your code here
    return {};
}`,
        javascript: `function topKFrequent(nums, k) {
    // Write your code here
    return [];
}`,
        java: `import java.io.*;
import java.util.*;

class Solution {
    public int[] topKFrequent(int[] nums, int k) {
        // Write your code here
        return new int[]{};
    }
}`
      },
      testCases: [{ input: "[1,1,1,2,2,3], 2", expected: "[1, 2]" }],
      expectedComplexity: "O(n log k)"
    },
    {
      id: "da_3",
      title: "Group Anagrams & String Cleansing",
      difficulty: "Medium",
      timeLimitMinutes: 12,
      topic: "Strings & Hash Grouping",
      description: `Given an array of strings \`strs\`, group the anagrams together. You can return the answer in any order.`,
      examples: [{ input: 'strs = ["eat","tea","tan","ate","nat","bat"]', output: '[["bat"],["nat","tan"],["ate","eat","tea"]]' }],
      constraints: ["Expected Time Complexity: O(n * k log k)"],
      starterCode: {
        python: `def groupAnagrams(strs: list[str]) -> list[list[str]]:
    # Write your code here
    return []`,
        cpp: `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
using namespace std;

vector<vector<string>> groupAnagrams(vector<string>& strs) {
    // Write your code here
    return {};
}`,
        javascript: `function groupAnagrams(strs) {
    // Write your code here
    return [];
}`,
        java: `import java.io.*;
import java.util.*;

class Solution {
    public List<List<String>> groupAnagrams(String[] strs) {
        // Write your code here
        return new ArrayList<>();
    }
}`
      },
      testCases: [{ input: '["eat","tea","tan","ate","nat","bat"]', expected: '[["eat","tea","ate"],["tan","nat"],["bat"]]' }],
      expectedComplexity: "O(n * k log k)"
    },
    {
      id: "da_4",
      title: "Matrix Search & Data Grid Traversal",
      difficulty: "Medium",
      timeLimitMinutes: 12,
      topic: "2D Matrix & Binary Search",
      description: `Write an efficient algorithm that searches for a value \`target\` in an \`m x n\` integer matrix. Each row is sorted and the first element is greater than the last element of previous row.`,
      examples: [{ input: "matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 3", output: "true" }],
      constraints: ["Expected Time Complexity: O(log(m * n))"],
      starterCode: {
        python: `def searchMatrix(matrix: list[list[int]], target: int) -> bool:
    # Write your code here
    return False`,
        cpp: `#include <iostream>
#include <vector>
using namespace std;

bool searchMatrix(vector<vector<int>>& matrix, int target) {
    // Write your code here
    return false;
}`,
        javascript: `function searchMatrix(matrix, target) {
    // Write your code here
    return false;
}`,
        java: `import java.io.*;
import java.util.*;

class Solution {
    public boolean searchMatrix(int[][] matrix, int target) {
        // Write your code here
        return false;
    }
}`
      },
      testCases: [{ input: "[[1,3,5,7],[10,11,16,20],[23,30,34,60]], 3", expected: "true" }],
      expectedComplexity: "O(log(m * n))"
    },
    {
      id: "da_5",
      title: "Subarray Sum Equals K Distribution",
      difficulty: "Medium",
      timeLimitMinutes: 12,
      topic: "Prefix Sums & Hash Map",
      description: `Given an array of integers \`nums\` and an integer \`k\`, return the total number of subarrays whose sum equals to \`k\`.`,
      examples: [{ input: "nums = [1,1,1], k = 2", output: "2" }],
      constraints: ["Expected Time Complexity: O(n)"],
      starterCode: {
        python: `def subarraySum(nums: list[int], k: int) -> int:
    # Write your code here
    return 0`,
        cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int subarraySum(vector<int>& nums, int k) {
    // Write your code here
    return 0;
}`,
        javascript: `function subarraySum(nums, k) {
    // Write your code here
    return 0;
}`,
        java: `import java.io.*;
import java.util.*;

class Solution {
    public int subarraySum(int[] nums, int k) {
        // Write your code here
        return 0;
    }
}`
      },
      testCases: [{ input: "[1,1,1], 2", expected: "2" }],
      expectedComplexity: "O(n)"
    }
  ],

  // =======================================================
  // ⚡ ECE & EV SPECIALIZED VERILOG / RTL HARDWARE DESIGN & VERIFICATION
  // =======================================================
  HARDWARE_VERILOG: [
    {
      id: "verilog_1",
      title: "D Flip-Flop with Active-Low Asynchronous Reset & Enable",
      difficulty: "Easy",
      timeLimitMinutes: 7,
      topic: "Sequential RTL & Register Design",
      description: `Design a parameterized D Flip-Flop with an active-low asynchronous reset (\`rst_n\`) and synchronous clock enable (\`en\`).

Specifications:
- Clock: \`clk\` (sensitive to positive edge).
- Reset: \`rst_n\` (active-low asynchronous reset). When \`rst_n == 0\`, \`q\` must immediately reset to 0.
- Enable: \`en\` (synchronous clock gate). When \`en == 1\` on rising edge of \`clk\`, \`q\` samples \`d\`.`,
      examples: [
        {
          input: "clk posedge, rst_n = 0, en = 1, d = 1'b1",
          output: "q = 1'b0 (Reset priority)"
        },
        {
          input: "clk posedge, rst_n = 1, en = 1, d = 1'b1",
          output: "q = 1'b1 (Data sampled)"
        }
      ],
      constraints: [
        "Synthesizable IEEE 1364 Verilog / SystemVerilog RTL",
        "Must avoid race conditions and inferred latches (use non-blocking '<=' assignments in sequential block)"
      ],
      starterCode: {
        verilog: `module d_flip_flop (
    input  wire clk,
    input  wire rst_n,
    input  wire en,
    input  wire d,
    output reg  q
);

    // Write your Verilog RTL code here

endmodule`,
        systemverilog: `module d_flip_flop (
    input  logic clk,
    input  logic rst_n,
    input  logic en,
    input  logic d,
    output logic q
);

    // Write your SystemVerilog RTL code here

endmodule`,
        cpp: `#include <stdint.h>

typedef struct {
    uint8_t q;
} D_FlipFlop;

void update_dff(D_FlipFlop* dff, uint8_t clk_edge, uint8_t rst_n, uint8_t en, uint8_t d) {
    // Write your C code here
}`,
        python: `class DFlipFlopModel:
    def __init__(self):
        self.q = 0

    def step(self, clk_edge, rst_n, en, d):
        # Write your Python code here
        return self.q`
      },
      testCases: [
        { input: "rst_n=0, clk=1, d=1", expected: "q=0" },
        { input: "rst_n=1, en=1, clk=1, d=1", expected: "q=1" },
        { input: "rst_n=1, en=0, clk=1, d=1", expected: "q=1 (Held)" }
      ],
      expectedComplexity: "1 Clock Cycle RTL Latency"
    },
    {
      id: "verilog_2",
      title: "4-Bit Synchronous Up/Down Counter with Overflow Flag",
      difficulty: "Easy-Medium",
      timeLimitMinutes: 10,
      topic: "Counters & Control Logic",
      description: `Design a 4-bit synchronous modulo-16 Up/Down Counter with active-low synchronous reset (\`rst_n\`), enable (\`en\`), and direction control (\`up_down\`).

Specifications:
- If \`rst_n == 0\`, \`count\` resets to \`4'b0000\`.
- If \`en == 1\` and \`up_down == 1\`, counter increments on each clock edge. If \`count == 15\`, next count wraps to 0 and \`overflow\` pulses HIGH.
- If \`en == 1\` and \`up_down == 0\`, counter decrements on each clock edge.`,
      examples: [
        { input: "count = 15, up_down = 1, en = 1, clk posedge", output: "count = 0, overflow = 1" }
      ],
      constraints: [
        "Synthesizable RTL with zero glitched overflow generation",
        "Width: 4 bits [3:0]"
      ],
      starterCode: {
        verilog: `module up_down_counter (
    input  wire       clk,
    input  wire       rst_n,
    input  wire       en,
    input  wire       up_down,
    output reg  [3:0] count,
    output wire       overflow
);

    // Write your Verilog RTL code here

endmodule`,
        systemverilog: `module up_down_counter #(parameter WIDTH = 4) (
    input  logic             clk,
    input  logic             rst_n,
    input  logic             en,
    input  logic             up_down,
    output logic [WIDTH-1:0] count,
    output logic             overflow
);

    // Write your SystemVerilog RTL code here

endmodule`,
        cpp: `#include <stdint.h>

typedef struct {
    uint8_t count;
    uint8_t overflow;
} Counter4Bit;

void step_counter(Counter4Bit* c, uint8_t rst_n, uint8_t en, uint8_t up_down) {
    // Write your C code here
}`,
        python: `class Counter4Bit:
    def __init__(self):
        self.count = 0
        self.overflow = 0

    def step(self, rst_n, en, up_down):
        # Write your Python code here
        return self.count, self.overflow`
      },
      testCases: [
        { input: "count=0, en=1, up=1 -> count=1", expected: "count=1, overflow=0" },
        { input: "count=15, en=1, up=1 -> count=0", expected: "count=0, overflow=1" }
      ],
      expectedComplexity: "O(1) Combinational & Sequential Logic"
    },
    {
      id: "verilog_3",
      title: "1011 Sequence Detector FSM (Overlapping Mealy)",
      difficulty: "Medium",
      timeLimitMinutes: 12,
      topic: "Finite State Machines & Verification",
      description: `Design a Mealy or Moore Finite State Machine (FSM) in Verilog to detect the serial bit sequence **\`1011\`** with support for overlapping sequences.

Example Bit Stream:
\`1 -> 0 -> 1 -> 1\` &rarr; \`detected = 1\`
\`1 -> 0 -> 1 -> 1 -> 0 -> 1 -> 1\` &rarr; \`detected = 1\` twice.`,
      examples: [
        { input: "Bit stream 1, 0, 1, 1", output: "detected = 1'b1" }
      ],
      constraints: [
        "State Encoding: 3-state or 4-state binary/one-hot encoding",
        "Must handle overlapping patterns correctly"
      ],
      starterCode: {
        verilog: `module seq_detector_1011 (
    input  wire clk,
    input  wire rst_n,
    input  wire din,
    output reg  detected
);

    // Write your Verilog RTL code here

endmodule`,
        systemverilog: `module seq_detector_1011 (
    input  logic clk,
    input  logic rst_n,
    input  logic din,
    output logic detected
);

    // Write your SystemVerilog RTL code here

endmodule`,
        cpp: `#include <stdint.h>

void step_fsm(int* state, int din, int* detected) {
    // Write your C code here
}`,
        python: `class FSM1011:
    def __init__(self):
        self.state = 0

    def step(self, din):
        # Write your Python code here
        return 0`
      },
      testCases: [
        { input: "1, 0, 1, 1", expected: "detected = 1" },
        { input: "1, 0, 1, 0", expected: "detected = 0" }
      ],
      expectedComplexity: "1-Cycle Mealy Output"
    },
    {
      id: "verilog_4",
      title: "Parameterized Synchronous FIFO Buffer with Full/Empty Flags",
      difficulty: "Medium-Hard",
      timeLimitMinutes: 15,
      topic: "Memory & Pointer Verification (Qualcomm/Nvidia Classic)",
      description: `Implement a Parameterized Synchronous First-In First-Out (FIFO) buffer with status flags (\`full\`, \`empty\`, \`fifo_count\`).

Parameters:
- \`DATA_WIDTH\`: Width of data bus (Default: 8 bits).
- \`ADDR_WIDTH\`: Address depth exponent (Default: 4 &rarr; 16 words depth).

Specifications:
- When \`wr_en == 1\` and \`!full\`, write \`data_in\` to memory at \`wr_ptr\`.
- When \`rd_en == 1\` and \`!empty\`, read \`data_out\` from memory at \`rd_ptr\`.`,
      examples: [
        { input: "16 writes without read", output: "full = 1'b1, empty = 1'b0" }
      ],
      constraints: [
        "Synthesizable Dual-Port or Ring Buffer Memory",
        "Must correctly compute full and empty flags to prevent buffer overflow/underflow"
      ],
      starterCode: {
        verilog: `module sync_fifo #(
    parameter DATA_WIDTH = 8,
    parameter ADDR_WIDTH = 4
)(
    input  wire                  clk,
    input  wire                  rst_n,
    input  wire                  wr_en,
    input  wire                  rd_en,
    input  wire [DATA_WIDTH-1:0] data_in,
    output reg  [DATA_WIDTH-1:0] data_out,
    output wire                  full,
    output wire                  empty,
    output reg  [ADDR_WIDTH:0]   fifo_cnt
);

    // Write your Verilog RTL code here

endmodule`,
        systemverilog: `module sync_fifo #(
    parameter int DATA_WIDTH = 8,
    parameter int ADDR_WIDTH = 4
)(
    input  logic                  clk,
    input  logic                  rst_n,
    input  logic                  wr_en,
    input  logic                  rd_en,
    input  logic [DATA_WIDTH-1:0] data_in,
    output logic [DATA_WIDTH-1:0] data_out,
    output logic                  full,
    output logic                  empty,
    output logic [ADDR_WIDTH:0]   fifo_cnt
);

    // Write your SystemVerilog RTL code here

endmodule`,
        cpp: `#include <stdint.h>

#define FIFO_DEPTH 16
typedef struct {
    uint8_t mem[FIFO_DEPTH];
    uint8_t wr_ptr;
    uint8_t rd_ptr;
    uint8_t count;
} SyncFIFO;

void fifo_init(SyncFIFO* f) {
    f->wr_ptr = f->rd_ptr = f->count = 0;
}

int fifo_write(SyncFIFO* f, uint8_t data) {
    // Write your C code here
    return 0;
}

int fifo_read(SyncFIFO* f, uint8_t* out) {
    // Write your C code here
    return 0;
}`,
        python: `class SyncFIFO:
    def __init__(self, depth=16):
        self.depth = depth
        self.buffer = []

    def write(self, data):
        # Write your Python code here
        return False

    def read(self):
        # Write your Python code here
        return None`
      },
      testCases: [
        { input: "Write 5 elements", expected: "count=5, empty=0, full=0" },
        { input: "Read when empty", expected: "empty=1, underflow prevented" }
      ],
      expectedComplexity: "O(1) Read / Write Cycle"
    },
    {
      id: "verilog_5",
      title: "PWM Pulse Generator & EV Motor Speed Controller",
      difficulty: "Hard",
      timeLimitMinutes: 15,
      topic: "Power Electronics & EV Battery Modulator",
      description: `Design a synthesizable 8-Bit Pulse Width Modulation (PWM) Controller module for EV Traction Motors and Battery Power Management.

Specifications:
- Clock Frequency: \`clk\`
- Inputs: \`rst_n\` (active-low reset), \`duty_cycle[7:0]\` (0 to 255 representing 0% to 100% duty).
- Output: \`pwm_out\` (High when \`counter < duty_cycle\`, Low otherwise).
- Resolution: 8 bits (256 clock cycles per PWM period).`,
      examples: [
        { input: "duty_cycle = 128 (50%)", output: "pwm_out HIGH for 128 cycles, LOW for 128 cycles" }
      ],
      constraints: [
        "Glitch-free PWM output with synchronous counter",
        "Must support 0% (constant LOW) and 100% (constant HIGH) boundary duty cycles"
      ],
      starterCode: {
        verilog: `module pwm_generator (
    input  wire       clk,
    input  wire       rst_n,
    input  wire [7:0] duty_cycle,
    output reg        pwm_out
);

    // Write your Verilog RTL code here

endmodule`,
        systemverilog: `module pwm_generator #(parameter int BITS = 8) (
    input  logic            clk,
    input  logic            rst_n,
    input  logic [BITS-1:0] duty_cycle,
    output logic            pwm_out
);

    // Write your SystemVerilog RTL code here

endmodule`,
        cpp: `#include <stdint.h>

typedef struct {
    uint8_t counter;
    uint8_t pwm_out;
} PWM_Generator;

void step_pwm(PWM_Generator* pwm, uint8_t rst_n, uint8_t duty_cycle) {
    // Write your C code here
}`,
        python: `class PWMGenerator:
    def __init__(self):
        self.counter = 0
        self.pwm_out = 0

    def step(self, rst_n, duty_cycle):
        # Write your Python code here
        return self.pwm_out`
      },
      testCases: [
        { input: "duty_cycle = 128 (50%)", expected: "pwm_out active 50% duty" },
        { input: "duty_cycle = 0 (0%)", expected: "pwm_out constant LOW" }
      ],
      expectedComplexity: "8-Bit Modulo Period (256 Cycles)"
    }
  ],

  // =======================================================
  // 🤖 ROBOTICS & CONTROLS SPECIALIZATION (ECE / Mech / EV)
  // =======================================================
  ROBOTICS: [
    {
      id: "robot_1",
      title: "Discrete PID Controller for Robotic Joint Control",
      difficulty: "Easy-Medium",
      timeLimitMinutes: 10,
      topic: "Control Systems & PID Feedback",
      description: `Implement a Discrete PID (Proportional-Integral-Derivative) Controller function to calculate the control signal \`u(t)\` for a robotic manipulator actuator.

Formulas:
- Error: \`e = setpoint - current_val\`
- Proportional: \`P = Kp * e\`
- Integral: \`I = I_prev + Ki * e * dt\`
- Derivative: \`D = Kd * (e - prev_e) / dt\`
- Output: \`u = P + I + D\``,
      examples: [
        { input: "setpoint = 100.0, current = 80.0, Kp = 1.0, Ki = 0.1, Kd = 0.05, dt = 0.1", output: "u = 30.2" }
      ],
      constraints: ["Expected Time Complexity: O(1) per step"],
      starterCode: {
        python: `def compute_pid(setpoint, current_val, prev_e, integral_prev, kp, ki, kd, dt):
    # TODO: Implement discrete PID equations (P, I, D)
    return 0.0, 0.0, 0.0`,
        cpp: `#include <iostream>

struct PIDResult {
    double u;
    double error;
    double integral;
};

PIDResult compute_pid(double setpoint, double current_val, double prev_e, double integral_prev, double kp, double ki, double kd, double dt) {
    // TODO: Implement discrete PID equations (P, I, D)
    return {0.0, 0.0, 0.0};
}`,
        javascript: `function computePID(setpoint, currentVal, prevE, integralPrev, kp, ki, kd, dt) {
    // TODO: Implement discrete PID equations (P, I, D)
    return { u: 0, error: 0, integral: 0 };
}`,
        java: `class PIDController {
    public static double compute(double setpoint, double currentVal, double prevE, double integralPrev, double kp, double ki, double kd, double dt) {
        // TODO: Implement discrete PID equations (P, I, D)
        return 0.0;
    }
}`
      },
      testCases: [
        { input: "setpoint=100, current=80, Kp=1, Ki=0.1, Kd=0.05, dt=0.1", expected: "u=30.2" }
      ],
      expectedComplexity: "O(1) Constant Calculation"
    },
    {
      id: "robot_2",
      title: "2D Forward Kinematics for 2-Link Robotic Arm",
      difficulty: "Easy-Medium",
      timeLimitMinutes: 10,
      topic: "Kinematics & Trigonometric Mapping",
      description: `Given a 2-Link planar robotic manipulator with link lengths \`L1\`, \`L2\` and joint angles \`theta1\`, \`theta2\` (in radians), compute the end-effector Cartesian coordinates \`(x, y)\`.

Formulas:
- \`x = L1 * cos(theta1) + L2 * cos(theta1 + theta2)\`
- \`y = L1 * sin(theta1) + L2 * sin(theta1 + theta2)\``,
      examples: [
        { input: "L1 = 10, L2 = 10, theta1 = 0, theta2 = 0", output: "x = 20.0, y = 0.0" }
      ],
      constraints: ["Angles in radians"],
      starterCode: {
        python: `import math

def forward_kinematics(l1, l2, theta1, theta2):
    # TODO: Calculate end-effector position (x, y)
    return 0.0, 0.0`,
        cpp: `#include <cmath>
#include <utility>

std::pair<double, double> forward_kinematics(double l1, double l2, double theta1, double theta2) {
    // TODO: Calculate end-effector position (x, y)
    return {0.0, 0.0};
}`,
        javascript: `function forwardKinematics(l1, l2, theta1, theta2) {
    // TODO: Calculate end-effector position (x, y)
    return [0.0, 0.0];
}`,
        java: `class Kinematics {
    public static double[] forward(double l1, double l2, double theta1, double theta2) {
        // TODO: Calculate end-effector position (x, y)
        return new double[]{0.0, 0.0};
    }
}`
      },
      testCases: [
        { input: "10, 10, 0, 0", expected: "[20.0, 0.0]" }
      ],
      expectedComplexity: "O(1) Geometric Matrix Multiplication"
    },
    {
      id: "robot_3",
      title: "LiDAR Distance Filter & Obstacle Detection Window",
      difficulty: "Medium",
      timeLimitMinutes: 12,
      topic: "Sensor Signal Processing & Moving Median",
      description: `Mobile robots receive noisy LiDAR beam distance readings. Implement a 1D filter that cleans invalid zero/inf readings and returns true if any obstacle is within safety threshold \`D_min\`.`,
      examples: [
        { input: "readings = [12.5, 0.0, 4.2, 18.0, 1.8], D_min = 2.0", output: "true (Obstacle at 1.8m)" }
      ],
      constraints: ["Expected Time Complexity: O(n)"],
      starterCode: {
        python: `def detect_obstacle(lidar_readings, d_min):
    # TODO: Filter noise and detect obstacle within d_min
    return False`,
        cpp: `#include <vector>
using namespace std;

bool detect_obstacle(const vector<double>& lidar_readings, double d_min) {
    // TODO: Filter noise and detect obstacle within d_min
    return false;
}`,
        javascript: `function detectObstacle(lidarReadings, dMin) {
    // TODO: Filter noise and detect obstacle within dMin
    return false;
}`,
        java: `class LiDARFilter {
    public static boolean detectObstacle(double[] readings, double dMin) {
        // TODO: Filter noise and detect obstacle within dMin
        return false;
    }
}`
      },
      testCases: [
        { input: "[12.5, 0.0, 4.2, 18.0, 1.8], 2.0", expected: "true" }
      ],
      expectedComplexity: "O(n) Stream Processing"
    }
  ]
};

export const TECH_BRANCHES = ["CSE", "IT", "MNC", "CS Design", "ECE", "EV"];
export const HARDWARE_BRANCHES = ["ECE", "EV"];
export const SOFTWARE_BRANCHES = ["CSE", "IT", "MNC", "CS Design"];
