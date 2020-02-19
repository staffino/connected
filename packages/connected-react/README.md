# `@connected/hooks`

An experimental React hooks package that makes 
using the `connected` package easy in React apps.

## Usage

```typescript jsx
// article.tsx
import React from 'react';
import { useResult } from '@connected/hooks';
import { findArticle } from './article.server';

const Article = ({ id }) => {
  const { title, intro } = useResult(findArticle, id);
  return (       
    <React.Fragment> 
      <h1>{title}</h1>
      <article>
        <p>{intro}</p>
      </article>
    </React.Fragment>);
}
```

```typescript jsx
// article.server.tsx                    
type Article = {
  title: string; 
  intro: string;
}
export async function findArticle(id: string): Promise<Article> {
  // This is Server! Load the article from database
}
```
