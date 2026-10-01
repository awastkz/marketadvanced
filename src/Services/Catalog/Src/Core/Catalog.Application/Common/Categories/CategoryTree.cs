using MarketAdvanced.Catalog.Domain;

namespace MarketAdvanced.Catalog.Application.Common.Categories;

public static class CategoryTree
{
    /// <summary>Id категории и всех её потомков: фильтр по категории включает подкатегории.</summary>
    public static IReadOnlyCollection<Guid> DescendantIds(IEnumerable<Category> all, Guid rootId)
    {
        var list = all.ToList();
        var ids = new HashSet<Guid> { rootId };
        var grew = true;
        while (grew)
        {
            grew = false;
            foreach (var c in list)
            {
                if (c.ParentId is not null && ids.Contains(c.ParentId.Value) && ids.Add(c.Id)) grew = true;
            }
        }
        return ids;
    }
}
