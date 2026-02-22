import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShopContext } from "../../context/shopContext";

const SearchBar = ({ className = "" }) => {
  const { products } = useContext(ShopContext);

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();

  // Unique searchable types
  const searchableItems = [
    ...new Set(products.map((item) => item.type?.toUpperCase())),
  ].filter(Boolean);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const filtered = searchableItems.filter((item) =>
      item.includes(query.toUpperCase())
    );

    setSuggestions(filtered);
  }, [query, products]);

  const handleSelect = (value) => {
    navigate(`/collections?type=${value}`);

    // Clear everything immediately
    setQuery("");
    setSuggestions([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const upperQuery = query.toUpperCase();

    if (searchableItems.includes(upperQuery)) {
      navigate(`/collections?type=${upperQuery}`);
    }

    // Always clear after pressing enter
    setQuery("");
    setSuggestions([]);
  };

  return (
    <div className={`relative w-full ${className}`}>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Search for 'Rings'"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full text-sm lg:text-base font-light text-[#8C8C8C] outline-none"
        />
      </form>

      {suggestions.length > 0 && (
        <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-lg mt-2 shadow-lg z-50">
          {suggestions.map((item, index) => (
            <div
              key={index}
              onClick={() => handleSelect(item)}
              className="px-4 py-2 cursor-pointer hover:bg-purple-50"
            >
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
