function getObjectDiff(original, current) {
  const changes = {};

  // Check current object's properties
  for (const [key, value] of Object.entries(current)) {
    if (!(key in original)) {
      changes[key] = value;
    }

    const originalValue = original[key];
    const currentValue = current[key];

    // Handle different types of comparisons
    if (
      originalValue !== currentValue &&
      String(originalValue) !== String(currentValue) &&
      JSON.stringify(originalValue) !== JSON.stringify(currentValue)
    ) {
      changes[key] = currentValue;
    }
  }

  // Check for removed properties
  for (const key of Object.keys(original)) {
    if (!(key in current)) {
      changes[key] = undefined;
    }
  }

  return Object.keys(changes).length === 0 ? null : changes;
}

export default getObjectDiff;
