using System;

// Input that will also take history from the request body
//   along with the entity object.
namespace backend_api.Models
{
    public class HistoryEntityInput<T> : EntityInput<T>
    {
        public class Event
        {
            public string EventType { get; set; }
            public DateTime EventDate { get; set; }
        }
        public Event[] AddHistory { get; set; }
        public int[] DeleteHistory { get; set; }
    }
}
