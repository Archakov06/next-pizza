'use client';

import { cn } from '@/shared/lib/utils';
import { Api } from '@/shared/services/api-client';
import { Product } from '@prisma/client';
import { Search } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { useClickAway, useDebounce } from 'react-use';

interface Props {
  className?: string;
}

export const SearchInput: React.FC<Props> = ({ className }) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [focused, setFocused] = React.useState(false);
  const [products, setProducts] = React.useState<Product[]>([]);
  const ref = React.useRef(null);

  useClickAway(ref, () => {
    setFocused(false);
  });

  // Обработчик нажатия ESC
	useEffect(() => {
		const handleEsc = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				setFocused(false);
				setSearchQuery('');
			}
		}

		document.addEventListener('keydown', handleEsc)

		// Удаляем обработчик при размонтировании компонента
		return () => {
			document.removeEventListener('keydown', handleEsc);
		}
	}, [])

  // Возобновлять фокус при печати в строке поиска
	const makeFocused = (value: string) => {
		setSearchQuery(value);
		setFocused(true);
	}

  useDebounce(
    async () => {
      try {
        const response = await Api.products.search(searchQuery);
        setProducts(response);
      } catch (error) {
        console.log(error);
      }
    },
    250,
    [searchQuery],
  );

  const onClickItem = () => {
    setFocused(false);
    setSearchQuery('');
    setProducts([]);
  };

  return (
    <>
      {focused && <div className="fixed top-0 left-0 bottom-0 right-0 bg-black/50 z-30" />}

      <div
        ref={ref}
        className={cn('flex rounded-2xl flex-1 justify-between relative h-11 z-30', className)}>
        <Search className="absolute top-1/2 translate-y-[-50%] left-3 h-5 text-gray-400" />
        <input
          className="rounded-2xl outline-none w-full bg-gray-100 pl-11"
          type="text"
          placeholder="Найти пиццу..."
          onFocus={() => setFocused(true)}
          value={searchQuery}
          onChange={(e) => makeFocused(e.target.value)}
        />

        {products.length > 0 && (
          <div
            className={cn(
              'absolute w-full bg-white rounded-xl top-14 shadow-md transition-all duration-200 invisible opacity-0 z-30',
              focused && 'visible opacity-100 top-12',
            )}>
            {products.map((product) => (
              <Link
                onClick={onClickItem}
                key={product.id}
                className={cn(
									'flex items-center gap-3 w-full px-3 py-2 hover:bg-primary/10',
									index === 0 && 'hover:rounded-t-xl', // Закругление верхнего края при наведении на первый элемент
									index === products.length - 1 && 'hover:rounded-b-xl', // Закругление нижнего края при наведении на последний элемент
								)}
                href={`/product/${product.id}`}>
                <img className="rounded-sm h-8 w-8" src={product.imageUrl} alt={product.name} />
                <span>{product.name}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
