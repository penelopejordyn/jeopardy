const url = "https://jservice.io/clues/"
const Ncategories = 6
const Nclues = 5


// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

let categories = [];


    let $buttonconatiner =  $("<div>").appendTo($("body"))
    let button = $("<button>", {
        text: "New Game",
         });
         button.appendTo($buttonconatiner)


/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

async function getCategoryIds() {
    let response = await axios.get('https://jservice.io/api/categories/', {
        params: {
            count: 100
        }
    })
// Function to shuffle an array using the Fisher-Yates (Knuth) shuffle algorithm
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  function deleteCategoriesWithEqualSign(dataArray) {
    const filteredArray = dataArray.filter((item) => {
        const clues = item.clues || [];
        const hasEqualSign = clues.some((clue) => clue.question.includes('=') || clue.answer.includes('='));
        return !hasEqualSign;
    });
    return filteredArray;
}

  //function to delete categories with less than 6 clues
  function deleteObjectsWithLessThanSixClues(dataArray) {
    const filteredArray = dataArray.filter((item) => item.clues_count >= 6);
    return filteredArray;
  }

  
  // Function to select the first n elements from an array
  function selectFirstNElements(array, n) {
    return array.slice(0, n);
  }  
  let filteredData = deleteObjectsWithLessThanSixClues(response.data);
  let filteredData2 = deleteCategoriesWithEqualSign(filteredData);
  let idArrays = filteredData2.map(id => id.id);
  shuffleArray(idArrays);
  result = selectFirstNElements(idArrays, 6);
  return result;
}
  



/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory() {
    const catIds = await getCategoryIds();
    const categoryPromises = catIds.map(async (category) => {
        const responses = await axios.get('https://jservice.io/api/category/', {
            params: {
                id: category
            }
        });
        // console.log(responses)
        let categeoryObj = {}
        categeoryObj.title = responses.data.title
        categeoryObj.clues = []

        // Function to shuffle an array using the Fisher-Yates (Knuth) shuffle algorithm
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
         const j = Math.floor(Math.random() * (i + 1));
         [array[i], array[j]] = [array[j], array[i]];
    }
  }
  
  // Function to select the first n elements from an array
  function selectFirstNElements(array, n) {
    return array.slice(0, n);
  }
        let clueArray = responses.data.clues
        shuffleArray(clueArray)
        let shuffledClueArray = selectFirstNElements(clueArray, 6)
        // console.log(shuffledClueArray)
        shuffledClueArray.map(function callback(clues) { 
        categeoryObj.clues.push(
            {
                question: clues.question,
                answer: clues.answer,
                isShowing : null
                 
            }
        )
        
                })
       
        
        
                return categeoryObj
        })
        
        return Promise.all(categoryPromises)
    }
    ;



/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */


async function fillTable() {

    const categories = await getCategory()

    let $buttonconatiner =  $("<div>").appendTo($("body"))
   let $conatiner =  $("<div>").appendTo($("body"))
   let $table = $("<table>").appendTo($conatiner)
  
  
   let button = $("<button>", {
    text: "New Game",
     });
     button.appendTo($buttonconatiner)
   let $thead = $("<thead>").appendTo($table)
   let $tbody = $("<tbody>").appendTo($table)
   let $trh = $("<tr>").appendTo($thead)

    categories.forEach(cat => {
      
        $("<th>").text(cat.title).appendTo($trh).addClass("th")
        let $trb = $("<tr>").appendTo($tbody)
        
        cat.clues.forEach(clue =>{
            $("<td>").text('?').appendTo($trb).addClass("td");
        })
        })

        
  return categories


}

async function handleClick() {
    const categories = await fillTable();
    const $td = $("td"); // Define $td outside the loop to avoid multiple selections

    $td.on("click", function (evt) {
        const categoryIndex = $(this).closest("tr").index();
        const clueIndex = $(this).index();

        const cat = categories[categoryIndex];
        const clue = cat.clues[clueIndex];

        if (clue.isShowing == null) {
            clue.isShowing = 'question';
            $(this).text(clue.question);
        } else if (clue.isShowing == 'question') {
            clue.isShowing = 'answer';
            $(this).text(clue.answer);
        } else {
            console.log('nothing I can do');
        }
    });
    return categories
}



/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {
    const $tableContainer = $("div")
    const $button = $("button")
    $tableContainer.remove()
    $button.remove()
    // Create and append the loading spinner to the container
    $("<div>").addClass("spinner").appendTo("body")
}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
     // Remove the loading spinner
  $(".spinner").remove();
  $("table").css('display', 'inline-block')
  $("button").css('display', 'inline-block')
  }


/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
    showLoadingView(); // Show loading view

    // Wait for 7 seconds before hiding the loading view
    
    setTimeout(() => {
        hideLoadingView(); // Hide loading view after 5 seconds
    }, 5000);// Hide loading view
  
    // Show the table after hiding the loading view
    await handleClick();
    $("table").css('display', 'none'); // Show the table
    $("button").css('display', 'none');
    // Call handleClick to handle clicks on the table
}


$("body").on("click", "button", setupAndStart)

/** On click of start / restart button, set up game. */

// TODO

/** On page load, add event handler for clicking clues */

// TODO