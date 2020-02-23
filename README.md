**Project title:** What’s Cooking

**Team name (on GitHub classroom):** YBGP

**Team members:**
*	Gowthami Palle
*	Yaaliny Balachandran

**Description of the web application:**
We aspire to build a recipe book web application where users can search for recipes using key ingredients. The application will have the following functionalities:
*	Users can use the app with or without having an account. However, more features (that are listed below) will be available to the users who have an account.
*	Users without an account can search for recipes based on key ingredients and view the comments and ratings on the recipes.
*	Users can create an account to get more personalized features.
*	Users with an account can favourite recipes for easy access in the future, as well as upload new recipes which can be viewed by all other users.
*	Users with an account can rate each recipe and add comments to it.
*	Users with an account have a profile page with a profile picture where they can edit their personal information such as change password or change their profile picture
*	Each user will have a personalized home page which will contain a list of suggested recipes based on their favourites. The homepage will also contain the list of recipes that were favourited by the user for easy access.

**Key features that will be completed by the Beta version:**
*	prototypes of all frontend pages for team members’ reference
*	frontend UI components are built based on the prototypes
*	users with or without an account can search for and view recipes based on key ingredients and view the rating and comments on each recipe
*	users can create an account
*	users with an account can rate, favourite, and comment on any recipe in the database

**Additional features that will be completed in the Final version:**
*	users with an account have a profile page where they can view and/or update their information
*	users with an account can upload/delete their own recipes to/from the database
*	each user with an account will have a personalized homepage. The homepage will contain a list of suggested recipes based on the recipes they have favourited, and a (paginated) list of all the recipes they have favourited recipes.


**Technologies that will be used:**
*	React - framework for frontend
*	NodeJS and Express- server-side languages
*	MongoDB - NoSQL database

**Description of 5 technical challenges:**
Both the group members had no experience with web development prior to taking CSCC09. So, building this application from scratch is quite challenging. More precisely, we will be tackling the following technical challenging:
*	Learning how to use React for the first time to make a UI that is appealing to the users
*	Learning how to use MongoDB for the first time to store user and recipe information in a database
*	Integrating a third-party recipe API along with our own database of recipes that are uploaded by users so that users can view both the recipes from the API as well as the recipes that were uploaded using our web application
*	Since we’re using a third-party API for the first time, it will be challenging to change and store the ratings and comments on recipes that are fetched from the API. This is challenging because we are only getting the recipes from the API. So, we will have to store the ratings and comments in our own database and link it with the recipes from the API every time they are fetched.
*	Deriving an accurate list of suggested recipes for users based on the recipes they had favourited
