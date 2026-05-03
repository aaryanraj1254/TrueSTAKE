import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { createAdminMarket } from '../../lib/api';

export const CreateMarketAdmin: React.FC = () => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Politics');
  const [closesAt, setClosesAt] = useState('');
  const [options, setOptions] = useState([
    { label: 'Yes', initial_price: 50 },
    { label: 'No', initial_price: 50 },
  ]);
  const [message, setMessage] = useState('');

  const createMutation = useMutation({
    mutationFn: createAdminMarket,
    onSuccess: () => {
      setMessage('Market created');
      setTitle('');
      setDescription('');
      queryClient.invalidateQueries({ queryKey: ['admin', 'markets'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'analytics'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'trending'] });
    },
  });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    createMutation.mutate({
      title,
      description,
      category,
      closes_at: new Date(closesAt).toISOString(),
      options,
    });
  };

  return (
    <main className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Create market</h1>
        <p className="mt-1 text-muted-foreground">
          Publish a new prediction market with initial option prices.
        </p>
      </div>

      {message && (
        <div className="rounded-lg bg-green-500/10 px-4 py-3 text-sm text-green-700">{message}</div>
      )}
      {createMutation.error && (
        <div className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-700">
          Could not create market
        </div>
      )}

      <form onSubmit={submit} className="space-y-5 rounded-lg border border-border bg-card p-5">
        <label className="block text-sm font-medium">
          Title
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="mt-2 w-full rounded-lg border border-input px-3 py-2"
            required
          />
        </label>

        <label className="block text-sm font-medium">
          Description
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="mt-2 min-h-24 w-full rounded-lg border border-input px-3 py-2"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium">
            Category
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="mt-2 w-full rounded-lg border border-input px-3 py-2"
            >
              <option>Politics</option>
              <option>Crypto</option>
              <option>Sports</option>
              <option>Pop Culture</option>
            </select>
          </label>
          <label className="block text-sm font-medium">
            Closes at
            <input
              type="datetime-local"
              value={closesAt}
              onChange={(event) => setClosesAt(event.target.value)}
              className="mt-2 w-full rounded-lg border border-input px-3 py-2"
              required
            />
          </label>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Options</h2>
            <button
              type="button"
              onClick={() => setOptions([...options, { label: '', initial_price: 50 }])}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-semibold hover:bg-accent"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>

          {options.map((option, index) => (
            <div key={index} className="grid gap-2 sm:grid-cols-[1fr_130px_40px]">
              <input
                value={option.label}
                onChange={(event) =>
                  setOptions(
                    options.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, label: event.target.value } : item,
                    ),
                  )
                }
                className="rounded-lg border border-input px-3 py-2"
                placeholder="Option label"
                required
              />
              <input
                type="number"
                min="1"
                max="99"
                value={option.initial_price}
                onChange={(event) =>
                  setOptions(
                    options.map((item, itemIndex) =>
                      itemIndex === index
                        ? { ...item, initial_price: Number(event.target.value) }
                        : item,
                    ),
                  )
                }
                className="rounded-lg border border-input px-3 py-2"
              />
              <button
                type="button"
                onClick={() => setOptions(options.filter((_, itemIndex) => itemIndex !== index))}
                className="rounded-lg border border-border p-2 hover:bg-accent"
                disabled={options.length <= 2}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={createMutation.isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground disabled:opacity-60"
        >
          {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Create market
        </button>
      </form>
    </main>
  );
};
