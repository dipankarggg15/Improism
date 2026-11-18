# Improism AI Playground performance baseline

Measured on 18 November 2026 with `gpt-6-luna`, all 2 AI Rules and 6 Brain principles supplied unchanged (53,218 instruction characters). Each comparison used the same prompt and a 600-token ceiling so responses could complete.

| Test | Setting | First text | Complete | Input | Cached input | Output | Reasoning |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Ordinary encouragement | Previous default (`medium`) | 4,651 ms | 5,918 ms | 10,864 | 10,861 | 164 | 46 |
| Ordinary encouragement | Optimized (`low`) | 1,474 ms | 2,551 ms | 10,864 | 10,837 | 116 | 0 |
| Multi-cause personal analysis | Previous default (`medium`) | 1,838 ms | 4,459 ms | 10,900 | 10,897 | 312 | 74 |
| Multi-cause personal analysis | Optimized (`low`) | 1,647 ms | 4,009 ms | 10,900 | 10,837 | 295 | 64 |

The ordinary response reached first text 68% sooner and completed 57% sooner. The complex response completed 10% sooner while retaining multi-cause analysis, a provisional conclusion, uncertainty, and a practical plan. Because network/model latency varies, these figures are directional rather than an SLA.

An earlier cold/warm pair using the optimized prefix recorded 10,837 cached tokens out of 10,864 input tokens on the repeat request (99.75%). The first request recorded 10,837 cache-write tokens; the repeat recorded zero writes. Actual per-response cache reads, writes, timing, and reasoning usage are now persisted and displayed in the playground.

## Changes based on the measurement

- Default reasoning effort changed from the model's implicit `medium` to explicit `low`.
- Admins can still select `none`, `medium`, or `high` for controlled testing.
- All foundational AI Rules and Brain principles remain in every request.
- The stable governing prefix now has an explicit 30-minute cache breakpoint; conversation history remains the variable suffix.
- OpenAI text is streamed to the browser as it arrives.
- Governing documents load through one ordered Supabase RPC instead of two table queries.
- Sending no longer refetches the entire conversation and conversation list after completion.

No selective retrieval was applied because every currently stored document is foundational governing material. Selective retrieval should only be added later for genuinely optional reference knowledge.
