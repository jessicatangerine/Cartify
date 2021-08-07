//Save recipe to local storage from https://www.taniarascia.com/how-to-use-local-storage-with-javascript/
const saveRecipes = (allRecipes) => {
    const recipesStringified = JSON.stringify(allRecipes)
    localStorage.setItem('Recipes', recipesStringified)
}
//Retrieve recipes from local storage from https://www.w3schools.com/jsref/met_storage_getitem.asp
const getAllRecipes = () => {
    const recipesJSON = localStorage.getItem('Recipes')
    if (recipesJSON === null) {
        return []
    } else {
        const recipesJSON = localStorage.getItem('Recipes')
        return recipesAll = JSON.parse(recipesJSON)
    }
}

const findRecipe = (allRecipes, recipeId) => {
    const recipe = allRecipes.find(function (element) {
        return element.id === recipeId
    })
    return recipe
}

const findIngredient = () => {

}

const addIngredient = (e, recipeIngredients) => {
    const ingredientID = uuidv4()
    recipeIngredients.push({
        id: ingredientID,
        name: e.target.elements[0].value,
        completionStatus: false
    })
}

const renderIngredients = (ingredients) => {
    //Select the ingredients section from https://www.w3schools.com/jsref/met_document_queryselector.asp
    const ingredientSection = document.querySelector('#ingredients-section')
    //Clear Ingredients Section
    ingredientSection.textContent = ''

    ingredients.forEach((element) => {
        //create the ingredient element
        const ingredientItem = document.createElement('p')
        //add checkbox to item from https://community.articulate.com/discussions/articulate-storyline/java-script-for-course-completion-status
        const checkBox = document.createElement('input')
        checkBox.setAttribute('type', 'checkbox')
        checkBox.checked = element.completionStatus
        checkBox.classList.add('checkbox')
        //check for checkbox changes and update ingredient status
        checkBox.addEventListener('change', (e) => {
            element.completionStatus = e.target.checked
            saveRecipes(allRecipes)
        })

        ingredientItem.appendChild(checkBox)
        //add element title to item if no input from https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement
        let itemName = document.createElement('span')
        if (element.name.length === 0) {
            itemName.textContent = 'Unnamed Ingredient'
        } else {
            itemName.textContent = element.name
        }
        itemName.classList.add('text-element')
        ingredientItem.appendChild(itemName)
        //add and remove button code from https://stackoverflow.com/questions/48333941/add-and-remove-button-javascript
        const removeButton = document.createElement('button')
        removeButton.innerHTML = '<i class="fas fa-trash-alt"></i>'
        removeButton.classList.add('remove-element')

        removeButton.addEventListener('click', function () {
            deleteIngredient(ingredients, element)
            renderIngredients(ingredients)
        })
        ingredientItem.appendChild(removeButton)
        //return item as ingredient element from https://www.w3schools.com/jsref/met_node_appendchild.asp
        ingredientSection.appendChild(ingredientItem)
    })
}

const deleteIngredient = (ingredients, element) => {
    const ingredientIndex = ingredients.findIndex((ingredient) => ingredient.id === element.id)
    ingredients.splice(ingredientIndex, 1)
}


const renderRecipe = (recipe) => {
    const recipeName = document.querySelector('#recipe-name')
    const recipeDescription = document.querySelector('#recipe-description')
    recipe.id = window.location.hash.substr(1)
    recipeName.value = recipe.name
    recipeDescription.value = recipe.description
    renderIngredients(recipe.ingredients)
}

const calculateCompletionStatus = (recipe) => {
    let count = 0
    //count number of items in ingredient list from https://www.w3schools.com/jsref/jsref_length_array.asp
    let numberOfIngredients = recipe.ingredients.length
    console.log(numberOfIngredients)
    //count number of ingredients checked-off from from https://www.w3schools.com/jsref/jsref_length_array.asp
    recipe.ingredients.forEach((ingredient) => {
        if (ingredient.completionStatus === true) {
            count++
        }
    })

    if (count === 0) {
        return 'You have<span> none </span>of the ingredients. 🥺'
    } else if (count === numberOfIngredients) {
        return 'Awesome! You have<span> all </span>the ingredients. 🤩'
    } else {
        return 'Great! You have <span> some </span>of the ingredients. 😋'
    }
}

const loadMainPage = () => {
    //Retrieve all recipes from local storage from https://www.w3schools.com/jsref/met_storage_getitem.asp
    const recipesFromStorage = getAllRecipes();
    //Display each recipe in local storage
    if (recipesFromStorage.length === 0) {
        let recipesDIV = document.querySelector('#recipes-div')
        let titleParagraph = document.createElement('h5')
        titleParagraph.innerHTML = 'What\'s cooking? Save a recipe:'
        recipesDIV.appendChild(titleParagraph)
    } else {
        recipesFromStorage.forEach(renderMainPageRecipes)
    }

}

//Recipe filter function from https://www.w3schools.com/jsref/jsref_filter.asp
const filterRecipes = (allRecipes, filter) => {
    return filteredArray = allRecipes.filter((recipe) => recipe.name.toLowerCase().includes(filter))
}

const renderFilteredRecipes = (filteredRecipes) => {
    let recipesDIV = document.querySelector('#recipes-div')
    recipesDIV.textContent = ''
    filteredRecipes.forEach(renderMainPageRecipes)
}

const renderMainPageRecipes = (recipe) => {
    let recipesDIV = document.querySelector('#recipes-div')
    let titleParagraph = document.createElement('h4')
    let summaryParagraph = document.createElement('h5')
    let recipeBox = document.createElement('a')


    titleParagraph.textContent = recipe.name
    titleParagraph.classList.add('list-item')

    let completionString = calculateCompletionStatus(recipe)
    summaryParagraph.classList.add('list-item__title')
    summaryParagraph.innerHTML = completionString

    recipeBox.appendChild(titleParagraph)
    recipeBox.appendChild(summaryParagraph)
    recipeBox.setAttribute('href', `./edit-recipe.html#${recipe.id}`)
    recipeBox.style.textDecoration = 'none'

    recipesDIV.appendChild(recipeBox)
}

const deleteRecipe = (allRecipes, recipeId) => {
    const recipeIndex = allRecipes.findIndex((recipe) => recipe.id === recipeId)

    allRecipes.splice(recipeIndex, 1)
}
