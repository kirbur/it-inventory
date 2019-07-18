using System;
using System.Collections.Generic;
using System.Reflection;
using System.Linq;

// Taken from this wonderful SO post.
// https://stackoverflow.com/questions/17385472/entity-framework-only-update-values-that-are-not-null
// This will map updated properties onto an existing object.
public static class WidgetUtil<T1, T2>
{
    public static readonly IEnumerable<Tuple<PropertyInfo, PropertyInfo>> PropertyMap;

    static WidgetUtil()
    {
        var b = BindingFlags.Public | BindingFlags.Instance;
        PropertyMap =
            (from f in typeof(T1).GetProperties(b)
             join t in typeof(T2).GetProperties(b) on f.Name equals t.Name
             select Tuple.Create(f, t))
            .ToArray();
    }
}
