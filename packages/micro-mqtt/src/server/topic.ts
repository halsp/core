export function matchTopic(pattern: string, topic: string) {
  const patternArray = pattern.split("/");
  const topicArray = topic.split("/");

  const length = patternArray.length;
  for (let i = 0; i < length; ++i) {
    const filterItem = patternArray[i];
    const topicItem = topicArray[i];
    if (filterItem === "#") {
      return topicArray.length >= length - 1;
    }
    if (filterItem !== "+" && filterItem !== topicItem) {
      return false;
    }
  }

  return length === topicArray.length;
}
