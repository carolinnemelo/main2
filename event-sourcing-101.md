# Event Sourcing

There are multiple ways to store data and information. One common way is to store `objects` as is.  
Such as, a `person` object in a .json file:

```json
{
  "name": "Adam West",
  "age": 34,
  "Country" : "USA"
}
```

Another way to store data is by storing events. Pieces of facts on how something changes over time. This is called an **Event Stream** . 
Imagine the events for a student:

```json
[
  {
    "name": "Adam West",
    "event": "enrolled",
    "date": "2022-01-02"
  },
  {
    "event": "complete-course",
    "date": "2022-05-08",
    "course": "Linear Algebra",
    "points": 30
  },
  {
    "event": "complete-course",
    "date": "2022-08-01",
    "course": "History 101",
    "points": 8
  }
]
```
By going through each event, one at a time, in an event stream, we can generate an aggregate, a projection of the thing events are for.
To show an example, we can generate the current status of a student using the events from above:
```json
{
  "name": "Adam West",
  "status": "enrolled",
  "totalPoints": 38,
  "coursesTaken": [
    "Linear Algebra",
    "History 101"
  ]
}
```

This storing of events, and generating objects from those events, is what is called **Event Sourcing**. We **source** (derive) the **current state** of something, based on the events that have acted on it.

[There are many resources on event sourcing](https://www.eventstore.com/event-sourcing), but for this lab, you only need to understand that we will generate objects based on an array of events, by applying each event to our generated object, one by one.
