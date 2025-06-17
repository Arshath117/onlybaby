import React, { useContext } from "react";
import { ToyStore } from "../context/ContextApi";
import LoadingState from "./LoadingState";
import ErrorState from "./ErrorState";

const UserPurchaseHistory = () => {
    const { orders, loading, error, openSidebar, products } = useContext(ToyStore);
    const [selectedOrder, setSelectedOrder] = React.useState(null);

    const HandleSideBar = (name) => {
        try {
            const viewProduct = products.find((e) => e.name === name);
            openSidebar(viewProduct);
        } catch (error) {
            console.log(`Error opening Product ${error}`);
        }
    };

    if (loading) return <LoadingState />;
    if (error) return <ErrorState error={error} />;

    // Helper function to check if 7 days have passed
    const isDelivered = (createdAt) => {
        const orderDate = new Date(createdAt);
        const currentDate = new Date();
        const diffTime = Math.abs(currentDate - orderDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 7;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8 transition-all duration-500">
            <div className="max-w-4xl mt-10 mx-auto">
                <h1 className="text-xl lg:text-4xl font-bold text-gray-600 mb-8 text-center animate-fade-in hover:scale-105 transform transition-transform duration-300">
                    Your Purchase History
                </h1>

                {orders.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg shadow-lg animate-fade-in hover:shadow-xl transition-shadow duration-300">
                        <p className="text-gray-500">No orders available.</p>
                    </div>
                )}

                <div className="space-y-6">
                    {orders.map((order, index) => (
                        <div
                            key={order._id}
                            className={`bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-500 
                                hover:shadow-xl hover:translate-y-[-2px] cursor-pointer animate-fade-in
                                ${selectedOrder === order._id ? 'ring-2 ring-purple-500' : ''}`}
                            style={{
                                animationDelay: `${index * 100}ms`,
                                transform: `translateY(${selectedOrder === order._id ? '-4px' : '0'})`
                            }}
                            onClick={() => setSelectedOrder(order._id === selectedOrder ? null : order._id)}
                        >
                            <div className="p-6 space-y-4">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-lg font-semibold text-gray-900 group flex items-center gap-2">
                                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-sm">
                                            {/* Display status based on whether 7 days have passed */}
                                            {isDelivered(order.createdAt)
                                                ? "Delivered"
                                                : order.isDelivered
                                                ? "Dispatched, delivered within 4-5 business days"
                                                : "Pending"
                                            }
                                        </span>
                                        <span className="text-gray-600 text-sm">Order Details</span>
                                    </h2>
                                </div>

                                <div className="border-t border-gray-100 pt-4 transition-all duration-300 hover:border-purple-100">
                                    <h3 className="text-md font-medium text-gray-900 mb-2 flex items-center gap-2">
                                        <span className="text-purple-500">📍</span> Shipping Address
                                    </h3>
                                    {order.shippingAddress ? (
                                        <div className="text-sm text-gray-600 space-y-1 pl-4 border-l-2 border-purple-100">
                                            <p className="font-medium">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                                            <p className="text-gray-500">{order.shippingAddress.streetAddress}</p>
                                            {order.shippingAddress.apartment && <p className="text-gray-500">{order.shippingAddress.apartment}</p>}
                                            <p className="text-gray-500">{order.shippingAddress.city}, {order.shippingAddress.country} {order.shippingAddress.postcode}</p>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">No shipping address available.</p>
                                    )}
                                </div>

                                <div className="border-t border-gray-100 mt-4 pt-4 transition-all duration-300 hover:border-purple-100">
                                    <h3 className="text-md font-medium text-gray-900 mb-2 flex items-center gap-2">
                                        <span className="text-purple-500">📦</span> Order Items
                                    </h3>
                                    {order.orderItems && order.orderItems.length > 0 ? (
                                        <ul className="divide-y divide-gray-100">
                                            {order.orderItems.map(item => (
                                                <li
                                                    key={item._id}
                                                    className="py-2 flex justify-between items-center hover:bg-gray-50 transition-colors duration-200 px-2 rounded-lg"
                                                    onClick={() => { HandleSideBar(item.name); console.log(item); }}
                                                >
                                                    <div className="space-x-4">
                                                        <span className="text-gray-600 font-semibold text-xl">{item.name}</span>
                                                        <span className="text-gray-600">Color : {item.color}</span>
                                                    </div>
                                                    <div className="text-sm flex items-center space-x-1"> {/* Flex for price alignment */}
                                                        <span className="text-gray-500">{item.quantity} × </span>
                                                        {item.discount && typeof item.discount === 'number' && item.discount > 0 ? (
                                                            <>
                                                                <span className="line-through text-gray-400 text-xs">
                                                                    ₹{item.price.toFixed(2)}
                                                                </span>
                                                                <span className="font-medium text-purple-600">
                                                                    ₹{(item.price * (1 - item.discount / 100)).toFixed(2)}
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <span className="font-medium text-purple-600">
                                                                ₹{item.price.toFixed(2)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-gray-500">No items found in this order.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default UserPurchaseHistory;