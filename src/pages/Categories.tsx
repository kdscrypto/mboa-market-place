
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { categories } from "@/data/categoriesData";
import CategoryCard from "@/components/CategoryCard";

const Categories = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow bg-mboa-gray py-12">
        <div className="mboa-container">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Toutes les catégories</h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Découvrez toutes nos catégories et trouvez exactement ce que vous cherchez
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                name={category.name}
                slug={category.slug}
                icon={category.icon}
                coverImage={category.coverImage}
                className="hover-scale"
              />
            ))}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Categories;
