import { useEffect } from "react";
import { socket } from "../services/socket";

export const useFeedSocket = ({ user, feeds, setFeeds }) => {
  useEffect(() => {
    if (!socket || !user) return;

    const handleCreateFeed = ({ userId, metadata }) => {
      // Check if user is in the userId array (friend list) and visibility list
      if (userId.includes(user._id) && metadata.visibility.includes(user._id)) {
        const {
          _id,
          description,
          imageUrl,
          userId: feedOwner,
          createdAt
        } = metadata;

        // Create simplified feed object with only needed information
        const simplifiedFeed = {
          _id,
          description,
          imageUrl,
          createdAt,
          userId: {
            _id: feedOwner._id,
            fullname: feedOwner.fullname,
            profileImageUrl: feedOwner.profileImageUrl
          }
        };

        // Add new feed to the beginning of the feeds array
        setFeeds(prevFeeds => [simplifiedFeed, ...prevFeeds]);
      }
    };

    const handleUpdateFeed = ({ userId, metadata }) => {
      // Check if user is in the userId array (friend list)
      if (userId.includes(user._id) && metadata.visibility.includes(user._id)) {
        const {
          _id,
          description,
          imageUrl,
          userId: feedOwner,
          createdAt
        } = metadata;

        setFeeds(prevFeeds => {
          const feedIndex = prevFeeds.findIndex(feed => feed._id === _id);
          
          const simplifiedFeed = {
            _id,
            description,
            imageUrl,
            createdAt,
            userId: {
              _id: feedOwner._id,
              fullname: feedOwner.fullname,
              profileImageUrl: feedOwner.profileImageUrl
            }
          };

          if (feedIndex !== -1) {
            // Update existing feed
            const updatedFeeds = [...prevFeeds];
            updatedFeeds[feedIndex] = simplifiedFeed;
            return updatedFeeds;
          } else {
            // Add new feed
            return [...prevFeeds, simplifiedFeed];
          }
        });
      }
    };

    const handleDeleteFeed = ({ userId, metadata }) => {
      if (userId.includes(user._id)) {
        setFeeds(prevFeeds => 
          prevFeeds.filter(feed => feed._id !== metadata.feedId)
        );
      }
    };

    const handleReactFeed = ({ userId, metadata }) => {
      if (userId === user._id) {
        const {
          _id,
          description,
          imageUrl,
          userId: feedOwner,
          reactions,
          createdAt
        } = metadata;

        setFeeds(prevFeeds => {
          const feedIndex = prevFeeds.findIndex(feed => feed._id === _id);
          
          if (feedIndex !== -1) {
            const updatedFeeds = [...prevFeeds];
            updatedFeeds[feedIndex] = {
              _id,
              description,
              imageUrl,
              createdAt,
              reactions,
              userId: {
                _id: feedOwner._id,
                fullname: feedOwner.fullname,
                profileImageUrl: feedOwner.profileImageUrl
              }
            };
            return updatedFeeds;
          }
          return prevFeeds;
        });
      }
    };

    // Subscribe to socket events
    socket.on("create_feed", handleCreateFeed);
    socket.on("update_feed", handleUpdateFeed);
    socket.on("delete_feed", handleDeleteFeed);
    socket.on("react_feed", handleReactFeed);

    // Cleanup function
    return () => {
      socket.off("create_feed", handleCreateFeed);
      socket.off("update_feed", handleUpdateFeed);
      socket.off("delete_feed", handleDeleteFeed);
      socket.off("react_feed", handleReactFeed);
    };
  }, [user, setFeeds]);

  return socket;
};