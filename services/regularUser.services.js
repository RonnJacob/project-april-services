const regularUserModel = require('../daos/regularUser.dao.server');
const userDao = require('../daos/user.dao.server');
const recipeModel = require('../daos/recipe.dao.server');

//TODO
//1. Add favorite recipe (Only read privilges).
//2. Delete recipe from list of favorites.
//3. Create owning recipe.
//4. Reading owning recipe (By ID and all owned recipes)
//5. Updating owned recipes.
//6. Deleting owned recipes.
//7. Adding an ingredient to list of ingredients.
//8. Updating a list of ingredients.
//9. Deleting an ingredient from a list of ingredients.
//10. Reading a list of ingredients.


module.exports = function (app) {

    registerRegularUser = (req, resp) => {
        var user = req.body;
        u = {
            username: user["username"],
            password: user["password"],
            firstName: user["firstName"],
            lastName: user["lastName"],
            userType: "REGULAR"
        };
        return userDao.createUser(u).then(
            res => {
                regUser = {
                    _id: res["_id"]
                };
                return regularUserModel.createRegularUser(regUser).then(newUser => {
                    req.session.user = newUser;
                    resp.send(newUser);
                });
            }
        );
        // userDao.createUser(user).then(user => {
        //     req.session.user = user;
        //     res.send(user);
        // });
    };

    findById = (req, res) => {
        regularUserModel.findRegularUserById(req.params['userId']).then(user => {
            console.log(user[0])
            res.send(user[0])
        });
    };

    favoriteARecipe = (req, res) => {
        regularUserModel.favoriteARecipe(req.params['userId'], req.params['recipeId'])
            .then(res.send('Recipe with ID ' + req.params['recipeId'] + ' ' +
                'has been added to favorites of user with ID ' + req.params['userId'] + ": " + +res.statusCode));
    }

    removeAFavorite = (req, res) => {
        regularUserModel.removeAFavorite(req.params['userId'], req.params['recipeId'])
            .then(res.send('Recipe with ID ' + req.params['recipeId'] + ' ' +
                'has been removed from favorites of user with ID ' + req.params['userId'] + ": " + +res.statusCode));
    }

    removeOwnRecipe = (req, res) => {
        regularUserModel.removeAFavorite(req.params['userId'], req.params['recipeId'])
            .then(res.send('Recipe with ID ' + req.params['recipeId'] + ' ' +
                'has been removed from own recipe of user with ID ' + req.params['userId'] + ": " + +res.statusCode));
    }

    // findAllFavorites = (req, res) => {
    //     regularUserModel.findRegularUserById(req.params['userId'])
    //         .then(user => recipeModel.findAllForRecipeIds(user[0]._doc.favoriteRecipes))
    //         .then(recipesModels => {
    //             let recipes = [];
    //             recipesModels.map(r => recipes.push(r._doc))
    //             console.log(recipes)
    //             return res.send(recipes)
    //         })
    // }

    findAllFavorites = (req, res) => {

        regularUserModel.findFavoriteRecipesForRegularUser(req.params['userId'])
        // .then(recipeIds => res.send(recipeIds[0].favoriteRecipes))
            .then(recipeIds => {
                var filtered = recipeIds[0].favoriteRecipes.filter(function(value){
                    return value.length > 5;
                });
                return recipeModel.findAllForRecipeIds(filtered)})
            .then(recipes => {
                res.send(recipes)
            })
    }

    findFavoriteRecipeId = (req, res) => {

        regularUserModel.findFavoriteRecipesForRegularUser(req.params['userId'])
            .then(recipeIds => res.send(recipeIds[0].favoriteRecipes))

    }

    app.post('/api/registerUser', registerRegularUser);
    app.post('/api/regularUser/:userId/recipes/:recipeId', favoriteARecipe)
    app.get('/api/regularUser/:userId/recipes', findAllFavorites)
    app.get('/api/regularUser/:userId/recipeId', findFavoriteRecipeId)
    app.get('/api/regularUser/:userId', findById)
    app.delete('/api/regularUser/:userId/recipes/:recipeId', removeAFavorite)
    app.delete('/api/user/:userId/recipes/:recipeId', removeOwnRecipe)

};
