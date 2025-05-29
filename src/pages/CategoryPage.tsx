
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { categories } from "@/data/categoriesData";
import CategoryPageContent from "@/components/category/CategoryPageContent";
import { useCategoryData } from "@/hooks/useCategoryData";

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  // Find the category from the slug
  const category = categories.find(cat => cat.slug === slug);

  // Load category results using custom hook
  const { results, totalCount, isLoading, error } = useCategoryData({
    slug,
    category,
    page,
    itemsPerPage: ITEMS_PER_PAGE
  });

  // Get the total number of pages
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        <CategoryPageContent
          category={category}
          results={results}
          totalCount={totalCount}
          isLoading={isLoading}
          error={error}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </main>

      <Footer />
    </div>
  );
};

export default CategoryPage;
