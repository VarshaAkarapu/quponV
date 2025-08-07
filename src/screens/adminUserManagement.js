import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';

export default function AdminUserManagement({ navigation }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        'https://m8igs45g3a.execute-api.ap-south-1.amazonaws.com/dev/api/users',
      );
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async userId => {
    Alert.alert(
      'Delete User',
      'Are you sure you want to delete this user? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(
                `https://m8igs45g3a.execute-api.ap-south-1.amazonaws.com/dev/api/users/${userId}`,
                {
                  method: 'DELETE',
                },
              );

              if (response.ok) {
                Alert.alert('Success', 'User deleted successfully');
                fetchUsers(); // Refresh the list
              } else {
                Alert.alert('Error', 'Failed to delete user');
              }
            } catch (error) {
              console.error('Failed to delete user:', error);
              Alert.alert('Error', 'Failed to delete user');
            }
          },
        },
      ],
    );
  };

  const filteredUsers = users.filter(
    user =>
      searchQuery === '' ||
      user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone?.includes(searchQuery) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const renderUserCard = user => (
    <View key={user.userId} style={styles.userCard}>
      <View style={styles.userHeader}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {user.firstName && user.lastName
              ? `${user.firstName} ${user.lastName}`
              : user.firstName || user.lastName || 'Unnamed User'}
          </Text>
          <Text style={styles.userPhone}>{user.phone}</Text>
        </View>
        <View
          style={[
            styles.roleBadge,
            {
              backgroundColor:
                user.role === 'admin' || user.role === 'Admin'
                  ? '#B71C1C'
                  : '#2196F3',
            },
          ]}
        >
          <Text style={styles.roleText}>{user.role}</Text>
        </View>
      </View>

      <View style={styles.userDetails}>
        {user.email && (
          <Text style={styles.detailText}>
            <Text style={styles.detailLabel}>Email: </Text>
            {user.email}
          </Text>
        )}
        <Text style={styles.detailText}>
          <Text style={styles.detailLabel}>Level: </Text>
          {user.userLevel || 1}
        </Text>
        <Text style={styles.detailText}>
          <Text style={styles.detailLabel}>Coupons Uploaded: </Text>
          {user.totalCouponsUploaded || 0}
        </Text>
        <Text style={styles.detailText}>
          <Text style={styles.detailLabel}>Profile Completed: </Text>
          {user.isProfileCompleted ? 'Yes' : 'No'}
        </Text>
        {user.upi && (
          <Text style={styles.detailText}>
            <Text style={styles.detailLabel}>UPI: </Text>
            {user.upi}
          </Text>
        )}
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => navigation.navigate('AdminUserDetails', { user })}
        >
          <Text style={styles.viewButtonText}>View Details</Text>
        </TouchableOpacity>
        {user.role !== 'admin' && user.role !== 'Admin' && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteUser(user.userId)}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Management</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{users.length}</Text>
          <Text style={styles.statLabel}>Total Users</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {users.filter(u => u.role === 'admin' || u.role === 'Admin').length}
          </Text>
          <Text style={styles.statLabel}>Admins</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {users.filter(u => u.isProfileCompleted).length}
          </Text>
          <Text style={styles.statLabel}>Completed Profiles</Text>
        </View>
      </View>

      {/* Users List */}
      <ScrollView style={styles.usersList} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#B71C1C" />
            <Text style={styles.loadingText}>Loading users...</Text>
          </View>
        ) : filteredUsers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No users found</Text>
          </View>
        ) : (
          filteredUsers.map(user => (
            <View key={user.userId || user._id}>{renderUserCard(user)}</View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    fontSize: 16,
    color: '#B71C1C',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 50,
  },
  searchContainer: {
    padding: 15,
    backgroundColor: '#fff',
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 25,
    fontSize: 16,
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#B71C1C',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  usersList: {
    flex: 1,
    padding: 15,
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: '#666',
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  roleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  userDetails: {
    marginBottom: 15,
  },
  detailText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  detailLabel: {
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  viewButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 5,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#F44336',
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 5,
  },
  viewButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  deleteButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});
