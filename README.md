[![make.fun · tiny-stack-vm-01-run-20261122](https://make.fun/badge/tiny-stack-vm-01-run-20261122.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122?utm_source=github&utm_medium=readme&utm_campaign=tiny-stack-vm-01-run-20261122)
[![rank](https://make.fun/badge/tiny-stack-vm-01-run-20261122/xbaystore/tiny-stack-vm-01-run-20261122/rank.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=tiny-stack-vm-01-run-20261122)
[![reward](https://make.fun/badge/tiny-stack-vm-01-run-20261122/xbaystore/tiny-stack-vm-01-run-20261122/reward.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122?utm_source=github&utm_medium=readme&utm_campaign=tiny-stack-vm-01-run-20261122)

# tiny-stack-vm

A small stack-based virtual machine written in plain Node.js with no
dependencies. It runs 32-bit integer programs: a 256-deep data stack, a
64-deep call stack, and 256 words of memory, all starting from zero.

Programs are raw byte files. The runner reads every case folder in the
input directory, executes its `program.bin` against `input.bin`, and
writes `stdout.bin` plus `exit.txt` for each case. Traps (bad opcode,
stack underflow, division by zero, out-of-range memory, step or output
limits) stop the machine immediately and become the exit code, keeping
whatever output was already produced.

The implementation aims to be exact rather than clever: arithmetic wraps
to signed 32 bits, division truncates toward zero, shifts mask to 5 bits,
and the per-step check order is fixed so simultaneous faults always
report the same trap.
