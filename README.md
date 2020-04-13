**Project title:** What’s Cooking

**Team name (on GitHub classroom):** YBGP

**Team members:**
*	Gowthami Palle
*	Yaaliny Balachandran

**Website URL:** https://afternoon-forest-07471.herokuapp.com/

**Video URL:** https://www.youtube.com/watch?v=xUfN4I6BbJQ

**Documentation URL:** Added REST API documentation in the [documentation](./documentation) directory.

**Description of the web application:**
We built a recipe book web application that allows users to search for recipes using a key ingredient. Users can search for recipes without an account, or sign up to create an account. With an account, users are able to have a personalized homepage and the ability to rate, comment and favourite recipes. The homepage will contain the 5 latest recipes that were favourited by the user along with the top-rated recipes (based on user ratings) from our database.
**Features of our website:**
* Users can either make an account or use our website without an account, where users with an account have more features
**Users Without An Account Features:**
* Users can search for recipes using a main ingredient
* Users can click on recipes and view their details, and they can see comments made by users with accounts
**Users With An Account Features:**
* Users can also search for recipes using a main ingredient
* Users can view recipe details and can favourite, rate and comment on these recipes
  * Users can favourite a recipe and it will be saved to the recent favourites list on their homepage for future use
  * Users can rate a recipe out of 5 stars and contribute to the average rating of a recipe. The average rating is calculated by taking the average of the ratings given by all users on the recipe.
  * Users can comment on recipes and remove their own comments, but not others
* Users have their homepage that has a search bar to search for more recipes, and two lists: Your Recent Favourites! and Try these top-rated recipes!
  * The ‘Your Recent Favourites!’ list contains the last 5 recipes the user has favourited
  * The ‘Try these top-rated recipes!’ contains the top 5 recipes with the highest average ratings
* User can also change their password

**Technologies that were be used:**
*	React - framework for frontend
*	NodeJS and Express - server-side languages
*	MongoDB - NoSQL database

**Notes:** We are using a third party API called Spoonacular to retrieve recipes. We only have 150 API calls per day, so if you are unable to search for recipes anymore, please contact us, so we can change the API key.