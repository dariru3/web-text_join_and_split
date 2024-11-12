// Call toggleCustomDelimiterInput on page load in case 'Other' is already selected
// and attach it to the select element's onchange event right away
window.onload = function () {
  toggleCustomDelimiterInput();
  document
    .getElementById("delimiterSelect")
    .addEventListener("change", toggleCustomDelimiterInput);
};

function toggleCustomDelimiterInput() {
  // Get the select dropdown and the custom delimiter input field
  var delimiterSelect = document.getElementById("delimiterSelect");
  var customDelimiterField = document.getElementById("customDelimiter");

  // Check if the selected value is 'other'
  if (delimiterSelect.value === "other") {
    // If 'other' is selected, show the custom delimiter input field
    customDelimiterField.style.display = "block";
  } else {
    // Otherwise, hide the custom delimiter input field
    customDelimiterField.style.display = "none";
  }
}

document.getElementById("processButton").addEventListener("click", function () {
  let text = document.getElementById("inputText").value;
  let delimiter = document.getElementById("delimiterSelect").value;

  text = adjustLines(text, delimiter); // combine lines to sentences
  const processedText = adjustByDelimiter(text, delimiter); // adjust for lists and a custom delimiter

  const outputText = document.getElementById("outputText");
  outputText.value = processedText;

  copyToClipboard(processedText);

  outputText.focus();
  outputText.select();
});

function adjustLines(text, delimiter) {
  if (delimiter === "。") {
    text = text.replace(/\r\n/g, "").replace(/\n/g, "");
  } else {
    text = text.replace(/\r\n/g, " ").replace(/\n/g, " ");
  }
  return text.replace(/▼/g, "\n");
}

function adjustByDelimiter(text, delimiter) {
  let processedText;
  if (delimiter === "numbered") {
    processedText = handleNumberedLists(text);
  } else if (delimiter === "•" || delimiter === "●") {
    processedText = handleBulletPoints(text, delimiter);
  } else {
    // For other delimiters, use the selected delimiter for splitting text
    if (delimiter === "other") {
      delimiter = document.getElementById("customDelimiter").value;
    }
    text = text.replace(new RegExp(`\\${delimiter}`, "g"), `${delimiter}\n`);

    processedText = cleanLines(text);
  }

  return processedText;
}

function handleBulletPoints(text, delimiter) {
  // Split the text at each bullet point, preserving the bullet
  const parts = text.split(delimiter);
  // Reconstruct the text, ensuring each part starts with the bullet point
  // Skip the first part if it doesn't start with a bullet point
  const processedParts = parts.map((part, index) =>
    index === 0 ? part.trim() : `${delimiter} ${part.trim()}`,
  );
  return processedParts.join("\n").trim();
}

function handleNumberedLists(text) {
  // Pattern to detect numbered list items, considering normalization has merged lines
  // This pattern looks for digits followed by a period and optionally a space, at the start or after a space
  const pattern = /(\d+\.\s)/g;

  // Replace the found patterns with the same pattern prefixed by a newline, except for the very first match
  // This ensures we do not prepend a newline at the very start of the text if it starts with a list item
  let isFirstItem = true;
  text = text.replace(pattern, (match) => {
    if (isFirstItem) {
      isFirstItem = false;
      return match; // Do not modify the first match
    }
    return "\n" + match; // Prefix all subsequent matches with a newline
  });

  return cleanLines(text);
}

function cleanLines(text) {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line);
  return lines.join("\n");
}

function copyToClipboard(processedText) {
  navigator.clipboard
    .writeText(processedText)
    .then(() => {
      document.getElementById("feedback").textContent =
        "Output text copied to clipboard!";
      setTimeout(
        () => (document.getElementById("feedback").textContent = ""),
        3000,
      );
    })
    .catch((err) => {
      console.error("Failed to copy text: ", err);
    });
}
