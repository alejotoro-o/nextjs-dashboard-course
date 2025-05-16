# Next.js App Router Course - Complete Dashboard and Concepts

This is the code for the complete dashboard created during the Next.js App Router Course. Additionally, I added some core concepts and best practices to this README that were shown during the course.

For more information, see the [course curriculum](https://nextjs.org/learn) on the Next.js Website.

## Setting Up Postgres Database using Docker

The course uses Vercel Postgres powered by Neon, I wanted to keep things locally so I ran a local Postgres instance using Docker. In Docker Hub you can find the official [Postgres Image](https://hub.docker.com/_/postgres).

To run the container just run the following command:

    docker run -d --name postgres -e POSTGRES_PASSWORD=1234 -v nextjs-dashboard-postgres:/var/lib/postgresql/dataesql/data -p 5432:5432 postgres

This will run the container using a volume named "nextjs-dashboard-postgres" and mapping port 5432 to the host port 5432.

Then you can set the environment variables in your .env file as:

    POSTGRES_URL=postgresql://postgres:1234@localhost:5432/postgres
    POSTGRES_USER=postgres
    POSTGRES_HOST=localhost
    POSTGRES_PASSWORD=1234
    POSTGRES_DATABASE=postgres

Finally you need to modify the line were the connection is established during the course. Change

    const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

to:

    const sql = postgres(process.env.POSTGRES_URL!); // Using docker postgres

## Concepts and best practices

### Automatic code-splitting and prefetching

To improve the navigation experience, Next.js automatically code splits your application by route segments. This is different from a traditional React [SPA](https://nextjs.org/docs/app/guides/single-page-applications), where the browser loads all your application code on the initial page load.

Splitting code by routes means that pages become isolated. If a certain page throws an error, the rest of the application will still work. This is also less code for the browser to parse, which makes your application faster.

Furthermore, in production, whenever <Link> components appear in the browser's viewport, Next.js automatically prefetches the code for the linked route in the background. By the time the user clicks the link, the code for the destination page will already be loaded in the background, and this is what makes the page transition near-instant!

### Always keep your .env file hidden

Go to your .gitignore file and make sure .env is in the ignored files to prevent your database secrets from being exposed when you push to GitHub.

### Troubleshooting database creation

- Make sure to reveal your database secrets before copying it into your .env file.
- The script uses bcrypt to hash the user's password, if bcrypt isn't compatible with your environment, you can update the script to use bcryptjs instead.
- If you run into any issues while seeding your database and want to run the script again, you can drop any existing tables by running DROP TABLE tablename in your database query interface. See the executing queries section below for more details. But be careful, this command will delete the tables and all their data. It's ok to do this with your example app since you're working with placeholder data, but you shouldn't run this command in a production app.

### Choosing how to fetch data

#### API layer

APIs are an intermediary layer between your application code and database. There are a few cases where you might use an API:

- If you're using third-party services that provide an API.
- If you're fetching data from the client, you want to have an API layer that runs on the server to avoid exposing your database secrets to the client.

In Next.js, you can create API endpoints using Route Handlers.

#### Database queries

When you're creating a full-stack application, you'll also need to write logic to interact with your database. For relational databases like Postgres, you can do this with SQL or with an ORM.

There are a few cases where you have to write database queries:

- When creating your API endpoints, you need to write logic to interact with your database.
- If you are using React Server Components (fetching data on the server), you can skip the API layer, and query your database directly without risking exposing your database secrets to the client.

#### Using Server Components to fetch data

By default, Next.js applications use React Server Components. Fetching data with Server Components is a relatively new approach and there are a few benefits of using them:

- Server Components support JavaScript Promises, providing a solution for asynchronous tasks like data fetching natively. You can use async/await syntax without needing useEffect, useState or other data fetching libraries.
- Server Components run on the server, so you can keep expensive data fetches and logic on the server, only sending the result to the client.
- Since Server Components run on the server, you can query the database directly without an additional API layer. This saves you from writing and maintaining additional code.

### What are request waterfalls?

A "waterfall" refers to a sequence of network requests that depend on the completion of previous requests. In the case of data fetching, each request can only begin once the previous request has returned data.

![Sequential and parallel data fetching](https://nextjs.org/_next/image?url=https%3A%2F%2Fh8DxKfmAPhn8O0p3.public.blob.vercel-storage.com%2Flearn%2Flight%2Fsequential-parallel-data-fetching.png&w=3840&q=75)

### Parallel data fetching

A common way to avoid waterfalls is to initiate all data requests at the same time - in parallel.

In JavaScript, you can use the Promise.all() or Promise.allSettled() functions to initiate all promises at the same time.

### What is streaming?

Streaming is a data transfer technique that allows you to break down a route into smaller "chunks" and progressively stream them from the server to the client as they become ready.

By streaming, you can prevent slow data requests from blocking your whole page. This allows the user to see and interact with parts of the page without waiting for all the data to load before any UI can be shown to the user.

Streaming works well with React's component model, as each component can be considered a chunk.

There are two ways you implement streaming in Next.js:

- At the page level, with the loading.tsx file (which creates <Suspense> for you).
- At the component level, with <Suspense> for more granular control.

### Deciding where to place your Suspense boundaries

Where you place your Suspense boundaries will depend on a few things:

1. How you want the user to experience the page as it streams.
2. What content you want to prioritize.
3. If the components rely on data fetching.

Take a look at your dashboard page, is there anything you would've done differently?

Don't worry. There isn't a right answer.

- You could stream the whole page like we did with loading.tsx... but that may lead to a longer loading time if one of the components has a slow data fetch.
- You could stream every component individually... but that may lead to UI popping into the screen as it becomes ready.
- You could also create a staggered effect by streaming page sections. But you'll need to create wrapper components.

Where you place your suspense boundaries will vary depending on your application. In general, it's good practice to move your data fetches down to the components that need it, and then wrap those components in Suspense. But there is nothing wrong with streaming the sections or the whole page if that's what your application needs.

### What is Partial Prerendering?

Partial Prerendering – a new rendering model that allows you to combine the benefits of static and dynamic rendering in the same route.

When a user visits a route:

- A static route shell that includes the navbar and product information is served, ensuring a fast initial load.
- The shell leaves holes where dynamic content like the cart and recommended products will load in asynchronously.
- The async holes are streamed in parallel, reducing the overall load time of the page.

### Why use URL search params?

As mentioned above, you'll be using URL search params to manage the search state. This pattern may be new if you're used to doing it with client side state.

There are a couple of benefits of implementing search with URL params:

- **Bookmarkable and shareable URLs:** Since the search parameters are in the URL, users can bookmark the current state of the application, including their search queries and filters, for future reference or sharing.
- **Server-side rendering:** URL parameters can be directly consumed on the server to render the initial state, making it easier to handle server rendering.
- **Analytics and tracking:** Having search queries and filters directly in the URL makes it easier to track user behavior without requiring additional client-side logic.

### Debouncing

Debouncing is a programming practice that limits the rate at which a function can fire. In our case, you only want to query the database when the user has stopped typing.

How Debouncing Works:

1. **Trigger Event:** When an event that should be debounced (like a keystroke in the search box) occurs, a timer starts.
2. **Wait:** If a new event occurs before the timer expires, the timer is reset.
3. **Execution:** If the timer reaches the end of its countdown, the debounced function is executed.

### What are Server Actions?

React Server Actions allow you to run asynchronous code directly on the server. They eliminate the need to create API endpoints to mutate your data. Instead, you write asynchronous functions that execute on the server and can be invoked from your Client or Server Components.

Security is a top priority for web applications, as they can be vulnerable to various threats. This is where Server Actions come in. They include features like encrypted closures, strict input checks, error message hashing, host restrictions, and more — all working together to significantly enhance your application security.

### Handling all errors with error.tsx

The error.tsx file can be used to define a UI boundary for a route segment. It serves as a catch-all for unexpected errors and allows you to display a fallback UI to your users.

### What is authentication?

Authentication is a key part of many web applications today. It's how a system checks if the user is who they say they are.

A secure website often uses multiple ways to check a user's identity. For instance, after entering your username and password, the site may send a verification code to your device or use an external app like Google Authenticator. This 2-factor authentication (2FA) helps increase security. Even if someone learns your password, they can't access your account without your unique token.

#### Authentication vs. Authorization

In web development, authentication and authorization serve different roles:

- **Authentication** is about making sure the user is who they say they are. You're proving your identity with something you have like a username and password.
- **Authorization** is the next step. Once a user's identity is confirmed, authorization decides what parts of the application they are allowed to use.

So, authentication checks who you are, and authorization determines what you can do or access in the application.

### Password hashing

It's good practice to hash passwords before storing them in a database. Hashing converts a password into a fixed-length string of characters, which appears random, providing a layer of security even if the user's data is exposed.

### Adding metadata

Next.js has a Metadata API that can be used to define your application metadata. There are two ways you can add metadata to your application:

- Config-based: Export a static metadata object or a dynamic generateMetadata function in a layout.js or page.js file.

- File-based: Next.js has a range of special files that are specifically used for metadata purposes:

    - favicon.ico, apple-icon.jpg, and icon.jpg: Utilized for favicons and icons
    - opengraph-image.jpg and twitter-image.jpg: Employed for social media images
    - robots.txt: Provides instructions for search engine crawling
    - sitemap.xml: Offers information about the website's structure

You have the flexibility to use these files for static metadata, or you can generate them programmatically within your project.