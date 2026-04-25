using BibliotecaApi.Data;
using Microsoft.EntityFrameworkCore;

namespace BibliotecaApi.Repositories;

public class Repository<T> : IRepository<T> where T : class
{
    protected readonly LibraryContext Context;
    protected readonly DbSet<T> DbSet;

    public Repository(LibraryContext context)
    {
        Context = context;
        DbSet = context.Set<T>();
    }

    public Task<List<T>> GetAllAsync()
    {
        return DbSet.AsNoTracking().ToListAsync();
    }

    public Task<T?> GetByIdAsync(int id)
    {
        return DbSet.FindAsync(id).AsTask();
    }

    public Task AddAsync(T entity)
    {
        return DbSet.AddAsync(entity).AsTask();
    }

    public void Update(T entity)
    {
        DbSet.Update(entity);
    }

    public void Delete(T entity)
    {
        DbSet.Remove(entity);
    }

    public Task<int> SaveChangesAsync()
    {
        return Context.SaveChangesAsync();
    }
}
