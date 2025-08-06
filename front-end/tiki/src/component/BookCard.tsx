import { useEffect, useState } from "react";
import { useParams } from "react-router";
import type { Books } from "../interface/book.interface";
import DescriptionComponent from "./descriptionComponent";

const BookDetailComponent = () => {
  const { id } = useParams();
  const [book, setBook] = useState<Books | null>(null);
  const [selectedImg, setSelectedImg] = useState<number>(0);

  useEffect(() => {
    if (id) {
      fetch(`http://localhost:3000/books/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setBook(data);
        });
    }
  }, [id]);

  if (!book) return <div className="p-8 text-center">Đang tải...</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5">
            <div className="bg-white rounded-lg p-4 flex flex-col items-center sticky top-4">
              <img
                src={book.images[selectedImg]?.large_url}
                alt={book.name}
                className="w-full max-w-sm h-96 object-contain rounded mb-4 border"
              />
              <div className="flex gap-2 mt-2 flex-wrap justify-center">
                {book.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img.thumbnail_url}
                    alt={book.name}
                    className={`w-12 h-16 object-contain rounded border cursor-pointer ${selectedImg === idx ? 'border-blue-500' : 'border-gray-200'}`}
                    onClick={() => setSelectedImg(idx)}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-lg p-6">
             
              <h1 className="text-2xl font-bold mb-2">{book.name}</h1>
              <div className="flex items-center gap-4 mb-2">
                <span className="text-yellow-500 font-bold text-lg">{book.rating_average} ★</span>
                <span className="text-gray-400 text-sm">Đã bán {book.quantity_sold?.value || 0}</span>
              </div>
              <div className="flex items-end gap-3 mb-2">
                <span className="text-3xl font-bold text-red-600">{book.list_price.toLocaleString()}₫</span>
                {book.original_price && book.original_price > book.list_price && (
                  <>
                    
                  </>
                )}
              </div>
              
              
            </div>
            
            <div className="bg-white rounded-lg p-6">
              <h2 className="text-lg font-bold mb-2">Mô tả sản phẩm</h2>
              <DescriptionComponent description={book.description || book.short_description || ""} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailComponent;