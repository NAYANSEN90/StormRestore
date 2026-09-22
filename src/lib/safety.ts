const SWITCH =
  /\b(switch(?:ing)?|de-?energiz|re-?energiz|open (?:the )?(?:breaker|recloser|device)|close (?:the )?(?:breaker|recloser|12-r1|device)|cut (?:the )?(?:jumper|primary)|tag out|loto|clear to work|issue (?:a )?switching order)\b/i;

export function isUnsafeRequest(text: string): boolean {
  return SWITCH.test(text);
}

export const SAFETY_REFUSAL =
  "Advisory only. I cannot issue switching orders, de-energize, or tell you to open or close a device. I will read official OMS orders verbatim when one exists. None is on file for F-12. Hold and contact Ridge Power dispatcher on TAC-2.";
