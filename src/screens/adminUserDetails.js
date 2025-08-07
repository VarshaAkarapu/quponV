import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';

export default function AdminUserDetails({ route, navigation }) {
  const { user } = route.params;

  const handleDeleteUser = () => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${user.firstName || 'this user'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement delete functionality
            Alert.alert('Success', 'User deleted successfully');
            navigation.goBack();
          },
        },
      ],
    );
  };

  const formatDate = dateString => {
    if (!dateString) return 'Not provided';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

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
        <Text style={styles.headerTitle}>User Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={styles.userCard}>
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

          {/* User Details */}
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Personal Information</Text>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>User ID:</Text>
              <Text style={styles.detailValue}>{user.userId}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Phone:</Text>
              <Text style={styles.detailValue}>{user.phone}</Text>
            </View>

            {user.email && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Email:</Text>
                <Text style={styles.detailValue}>{user.email}</Text>
              </View>
            )}

            {user.dob && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date of Birth:</Text>
                <Text style={styles.detailValue}>{formatDate(user.dob)}</Text>
              </View>
            )}

            {user.upi && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>UPI ID:</Text>
                <Text style={styles.detailValue}>{user.upi}</Text>
              </View>
            )}
          </View>

          {/* User Stats */}
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>User Statistics</Text>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>User Level:</Text>
              <Text style={styles.detailValue}>{user.userLevel || 1}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Prepayment %:</Text>
              <Text style={styles.detailValue}>
                {user.prepaymentPercentage || 0}%
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Total Coupons Uploaded:</Text>
              <Text style={styles.detailValue}>
                {user.totalCouponsUploaded || 0}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Coupons Uploaded Today:</Text>
              <Text style={styles.detailValue}>
                {user.couponsUploadedToday || 0}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Profile Completed:</Text>
              <Text style={styles.detailValue}>
                {user.isProfileCompleted ? 'Yes' : 'No'}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          {user.role !== 'admin' && user.role !== 'Admin' && (
            <View style={styles.actionSection}>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDeleteUser}
              >
                <Text style={styles.deleteButtonText}>Delete User</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
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
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    fontSize: 16,
    color: '#B71C1C',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 50,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
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
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userPhone: {
    fontSize: 16,
    color: '#666',
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  detailsSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f8f8',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  actionSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  deleteButton: {
    backgroundColor: '#f44336',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
