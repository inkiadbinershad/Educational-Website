document.getElementById('pdfUploadForm').onsubmit = function (e) {
    e.preventDefault(); // Prevent form submission
    const fileInput = document.getElementById('pdfFile').files[0];

    if (!fileInput) {
        alert('Please upload a PDF file.');
        return;
    }

    // Use FileReader to read the PDF
    const reader = new FileReader();
    reader.onload = function () {
        const typedArray = new Uint8Array(this.result);
        pdfjsLib.getDocument(typedArray).promise.then(function (pdf) {
            let textPromises = [];
            for (let i = 1; i <= pdf.numPages; i++) {
                textPromises.push(pdf.getPage(i).then(page => {
                    return page.getTextContent().then(textContent => {
                        return textContent.items.map(item => item.str).join(' ');
                    });
                }));
            }

            Promise.all(textPromises).then(texts => {
                const content = texts.join(' ');
                processQuizContent(content); // Process the extracted text
            }).catch(function (error) {
                alert('Error extracting text from PDF: ' + error.message);
            });
        }).catch(function (error) {
            alert('Error reading PDF file: ' + error.message);
        });
    };

    reader.readAsArrayBuffer(fileInput); // Ensure the PDF is read as an ArrayBuffer
};

// Function to process and extract quiz questions from the PDF content
function processQuizContent(content) {
    // Regex pattern to match questions and answers
    const questions = content.match(/Q\.\s*([^\n]*)(?:\nA\.\s*([^\n]*))?(?:\nB\.\s*([^\n]*))?(?:\nC\.\s*([^\n]*)\s*&)?(?:\nD\.\s*([^\n]*))?/g);
    const quizContainer = document.getElementById('quizContainer');
    quizContainer.innerHTML = ''; // Clear previous content
    const resultContainer = document.getElementById('resultContainer');
    resultContainer.style.display = 'none'; // Hide the result section initially

    if (questions) {
        const quizForm = document.createElement('form');

        questions.forEach((question, index) => {
            const quizItem = document.createElement('div');
            quizItem.classList.add('quiz-item');

            // Split the question into lines
            const lines = question.split('\n').filter(line => line.trim() !== '');

            // Display the question
            quizItem.innerHTML = `<p>${lines[0]}</p>`; // Question

            // Loop through each option (A, B, C, D)
            lines.slice(1).forEach(line => {
                const optionText = line.trim();
                const optionLetter = optionText.charAt(0); // Get A, B, C, or D
                const optionAnswer = optionText.slice(3); // Get the rest of the text

                const label = document.createElement('label');
                const radioButton = document.createElement('input');
                radioButton.type = 'radio';
                radioButton.name = `question-${index}`; // Group by question
                radioButton.value = optionLetter; // Store the option letter (A, B, C, D)

                label.appendChild(radioButton);
                label.appendChild(document.createTextNode(optionAnswer));
                quizItem.appendChild(label);
            });

            quizForm.appendChild(quizItem);
        });

        quizContainer.appendChild(quizForm);

        // Create a submit button
        const submitButton = document.createElement('button');
        submitButton.textContent = 'Submit';
        submitButton.type = 'button'; // Prevent form submission
        submitButton.onclick = function () {
            const results = checkAnswers(questions, quizForm);
            displayResults(results); // Display results in the result container
        };
        quizContainer.appendChild(submitButton);
    } else {
        alert('No valid questions found in the PDF. Make sure the format is correct.');
    }
}

// Function to check the answers and provide detailed feedback
function checkAnswers(questions, quizForm) {
    let correctAnswers = 0;
    let totalQuestions = questions.length;
    let feedback = '';

    questions.forEach((question, index) => {
        // Find the correct answer using "&" symbol
        const answerMatch = question.match(/([A-D])\.\s*.*&/);
        const correctOption = answerMatch ? answerMatch[1] : null;

        // Get the user's selected option
        const userSelectedOption = quizForm.elements[`question-${index}`]?.value;

        if (userSelectedOption === correctOption) {
            correctAnswers++;
            feedback += `Question ${index + 1}: Correct! Your answer: ${userSelectedOption}\n`;
        } else {
            feedback += `Question ${index + 1}: Incorrect. Your answer: ${userSelectedOption || 'None'} | Correct answer: ${correctOption}\n`;
        }
    });

    const wrongAnswers = totalQuestions - correctAnswers;
    feedback += `\nYou got ${correctAnswers} correct and ${wrongAnswers} wrong out of ${totalQuestions} questions.`;
    return feedback; // Return detailed feedback
}

// Function to display results in the results section
function displayResults(results) {
    const resultContainer = document.getElementById('resultContainer');
    resultContainer.style.display = 'block'; // Show the results section
    resultContainer.innerText = results; // Set results text
}
