using System;
using System.Collections.Generic;
using System.Reflection;
using System.Linq;

/* Adapted from this wonderful SO post.
 * https://stackoverflow.com/questions/17385472/entity-framework-only-update-values-that-are-not-null
 * This class will map updated properties onto an existing object.
 */
public static class PropertyUtil<T1, T2>
{
    public static readonly IEnumerable<Tuple<PropertyInfo, PropertyInfo>> PropertyMap;

    /* Constructor sets PropertyMap to the merged set of the properties.
     * Must be instantiated with two types.
     */
    static PropertyUtil()
    {
        // b denotes the specific types of properties that will be combined.
        var b = BindingFlags.Public | BindingFlags.Instance;
        PropertyMap =
            (from f in typeof(T1).GetProperties(b)
             join t in typeof(T2).GetProperties(b) on f.Name equals t.Name
             select Tuple.Create(f, t))
            .ToArray();
    }

    /* UpdateProperties(item, updatedItem) will update all the overlapping properties of two objects
     *   when the new property value is not null.
     */
    public static void UpdateProperties(T1 item, T2 updatedItem)
    {
        foreach (var overlappingProperty in PropertyMap)
        {
            var newValue = overlappingProperty.Item2.GetValue(updatedItem, null);
            if (newValue != null)
            {
                overlappingProperty.Item1.SetValue(item, newValue, null);
            }
        }
    }
}
