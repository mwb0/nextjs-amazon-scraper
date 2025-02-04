import ClientHome from '@/components/ClientHome';
import { getAllProducts } from '@/lib/actions';
import { ProductType } from '@/types';

const Home = async () => {
  const initialProducts: ProductType[] | undefined = await getAllProducts();
  return <ClientHome initialProducts={initialProducts} />;
};

export default Home;