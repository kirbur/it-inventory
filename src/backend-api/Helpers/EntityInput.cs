// Generic Input that will take an object from request body.
namespace backend_api.Models
{
    public class EntityInput<T>
    {
        public T Entity { get; set; }
    }
}
