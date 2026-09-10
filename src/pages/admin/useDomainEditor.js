// useDomainEditor.js
// Shared state/save/reset logic for each Portfolio Manager tab so
// every tab doesn't reimplement the same localStorage plumbing.

import { useCallback, useState } from "react";
import { getEffectiveData, saveOverride, resetOverride, hasOverride } from "../../utils/portfolioStorage";

export default function useDomainEditor(domain, original) {
  const [data, setData] = useState(() => {
    const effective = getEffectiveData(domain, original);
    // Deep-clone so edits never mutate the imported JSON module or a
    // cached localStorage object by reference.
    return typeof structuredClone === "function" ? structuredClone(effective) : JSON.parse(JSON.stringify(effective));
  });
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', message }
  const [isOverridden, setIsOverridden] = useState(() => hasOverride(domain));

  const save = useCallback(() => {
    const result = saveOverride(domain, data);
    if (result.ok) {
      setStatus({ type: "success", message: "Saved. This change is stored locally in this browser." });
      setIsOverridden(true);
    } else {
      setStatus({ type: "error", message: result.error });
    }
    return result;
  }, [domain, data]);

  const resetToOriginal = useCallback(() => {
    resetOverride(domain);
    const clone = typeof structuredClone === "function" ? structuredClone(original) : JSON.parse(JSON.stringify(original));
    setData(clone);
    setIsOverridden(false);
    setStatus({ type: "success", message: "Reset to the original shipped content." });
  }, [domain, original]);

  return { data, setData, status, setStatus, save, resetToOriginal, isOverridden };
}
